import express from "express";
import multer from "multer"; // For handling file uploads
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
import { PDFDocument } from "pdf-lib";

import { MONGO_DB_CONFIG } from "./config/app.config.js";

import { fileTypeFromBuffer } from "file-type";
import { readFile } from "fs/promises";

import './jobs/cronJobs.js';

import User from "./models/user.model.js";

import * as dotenv from "dotenv";
dotenv.config(); // Load environment variables

const app = express();
const port = 5000; // Or any port you prefer
const server_version = MONGO_DB_CONFIG.SERVER_VERSION;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_FOLDER = path.join(__dirname, "file"); // Use path.join for cross-platform compatibility
fs.mkdirSync(UPLOAD_FOLDER, { recursive: true }); // Create directory if doesn't exist

const storage = multer.diskStorage({
  destination: UPLOAD_FOLDER,
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use original filename
  },
});

const upload = multer({ storage: storage });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

let total_token_output = 0;
let total_token_input = 0;
let total_token_in_and_out = 0;
let total_api_visit = 0;

async function getMimeType(filePath) {
  try {
    const buffer = await readFile(filePath);
    const type = await fileTypeFromBuffer(buffer);
    return type?.mime || "application/octet-stream";
  } catch (error) {
    console.error("Lỗi khi xác định MIME type:", error);
    return "application/octet-stream";
  }
}

app.post("/api/convert/file/create", upload.single("file"), async (req, res) => {
  try {
    let statusSendFile = false;
    const version = req.body.version;

    const type = req.body.type;
    const file = req.file;
    //info user
    const email = req.body.email;
    const password = req.body.password;

    let infoUser = null;

    const endPage = req.body.endPage;
    const startPage = req.body.startPage;

    total_api_visit += 1;
    console.log("-----------NEW REQUEST--------------");
    console.log("email: " + email);
    console.log("password: " + password);
    console.log("version client: " + version);
    console.log("version server: " + server_version);
    console.log("endPage: " + endPage);
    console.log("startPage: " + startPage);
    console.log("type: " + type);
    
    if (version != server_version) {
      return res.json({ statusSendFile: statusSendFile, data: "Phiên bản không hợp lệ, vui lòng cập nhật phiên bản mới để tiếp tục sử dụng" });
    }

    if (!file) {
      return res.json({ statusSendFile: statusSendFile, data: "Chưa chọn file để sử dụng" });
    }

    if (email == undefined || email == "") {
      return res.json({ statusSendFile: statusSendFile, data: "Vui lòng đăng nhập tài khoản để sử dụng!" });
    }

    const userData = await User.findOne({ email: email });
   
    if (userData == null) {
      return res.json({ statusSendFile: statusSendFile, data: "Tài khoản không tồn tại!" });
    } else {
      
      if (!bcrypt.compareSync(password, userData.password)) {
        return res.json({ statusSendFile: statusSendFile, data: "Thông tin tài khoản hoặc mật khẩu không chính xác!" });
      } else {
        infoUser = userData;
        if (userData.cryptoToken < 5000) {
          return res.json({
            statusSendFile: statusSendFile,
            data: "Phải có trên 🔥 5,000 mới được sử dụng, bạn có thể xem video quảng cáo để tăng thêm 🔥 nhé!",
          });
        } else {
          const filePath = path.join(UPLOAD_FOLDER, file.filename); // Corrected file path
          const fileManager = new GoogleAIFileManager(GEMINI_API_KEY);

          const fileMimeType = await getMimeType(filePath);
          console.log("Detected MIME Type:", fileMimeType);

          if (type == "quiz") {
            const fileBytes = fs.readFileSync(filePath);

            // Load file PDF gốc
            const pdfDoc = await PDFDocument.load(fileBytes);
            const newPdf = await PDFDocument.create();

            // Kiểm tra trang hợp lệ
            const totalPages = pdfDoc.getPageCount();
            if (startPage < 1 || endPage > totalPages || startPage > endPage) {
              return res.status(400).json({ error: "Trang không hợp lệ" });
            }

            // Trích xuất các trang từ PDF gốc
            const copiedPages = await newPdf.copyPages(
              pdfDoc,
              Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage - 1 + i)
            );

            // Thêm trang đã sao chép vào PDF mới
            copiedPages.forEach((page) => newPdf.addPage(page));

            // Lưu file mới
            const newPdfBytes = await newPdf.save();
            const newFileName = `extracted_${Date.now()}.pdf`;
            const newFilePath = path.join(UPLOAD_FOLDER, newFileName);
            fs.writeFileSync(newFilePath, newPdfBytes);

            console.log("PDF mới đã lưu:", newFilePath);

            const sample_pdf = await fileManager.uploadFile(newFilePath, {
              mimeType: fileMimeType,
            });

            const prompt = `
            **Yêu cầu:**
            Tôi muốn bạn đọc file PDF đính kèm và chuyển đổi nội dung của nó thành các câu hỏi trắc nghiệm dạng JSON.
        
            **Hướng dẫn:**
            1. **Phân tích nội dung:** Xác định các phần nội dung quan trọng trong file PDF (chương, mục, đoạn) và biến chúng thành câu hỏi.
            2. **Cấu trúc JSON:**
               - Mỗi câu hỏi phải bao gồm:
                 - \`"question"\`: Câu hỏi.
                 - \`"options"\`: Một danh sách các lựa chọn.
                 - \`"answer"\`: Lựa chọn đúng trong danh sách.
               - Đảm bảo đúng cấu trúc mẫu sau:
                 \`\`\`json
                 [JSON_START]
                 {
                   "questions": [
                     {
                       "question": "What is an operating system?",
                       "options": [
                         "A collection of programs that manage hardware resources",
                         "A system service provider to application programs",
                         "A link between hardware and application programs",
                         "All of the mentioned"
                       ],
                       "answer": "All of the mentioned"
                     }
                   ]
                 }
                 [JSON_END]
                 \`\`\`
            3. **Quy tắc:**
               - Chỉ một đáp án đúng cho mỗi câu hỏi.
               - Chuyển đổi tối đa nội dung thành câu hỏi, ưu tiên nội dung dễ hiểu.
               - Toàn bộ câu trả lời phải nằm giữa \`[JSON_START]\` và \`[JSON_END]\`.
               - Chỉ chuyển tối đa 30 câu trắc nghiệm.
            `;

            // const response = await model.generateContent([prompt, sample_pdf]);
            const response = await model.generateContent([
              prompt,
              {
                fileData: {
                  fileUri: sample_pdf.file.uri,
                  mimeType: sample_pdf.file.mimeType,
                },
              },
            ]);

            if (response.response.usageMetadata) {
              statusSendFile = true;
              total_token_output += response.response.usageMetadata.candidatesTokenCount;
              total_token_input += response.response.usageMetadata.promptTokenCount;
              total_token_in_and_out += response.response.usageMetadata.totalTokenCount;
              let profit = Math.round(response.response.usageMetadata.totalTokenCount * 0.2);     //lợi nhuận 20% trên file
              userData.cryptoToken -= Math.round(response.response.usageMetadata.totalTokenCount + profit);
              await userData.save();
              console.log(`-----------RESULT------------`);
              console.log(`email: ` + email);
              console.log(`Loại: ` + type);
              console.log(`User còn lai: ` + userData.cryptoToken);
              console.log('Lợi nhuận: ' + profit)
              console.log('Tổng đã trừ: ' + Math.round(response.response.usageMetadata.totalTokenCount + profit));
              console.log(`Tổng In và Out: ${response.response.usageMetadata.totalTokenCount}`);
              console.log(`Tổng Output: ${response.response.usageMetadata.candidatesTokenCount}`);
              console.log(`Tổng Input : ${response.response.usageMetadata.promptTokenCount}`);
              //console.log(`-----------------------------`);
            }

            const responseText = response.response.text(); // Lấy text từ response

            const startIndex = responseText.indexOf("[JSON_START]") + "[JSON_START]".length;
            const endIndex = responseText.indexOf("[JSON_END]");
            const jsonString = responseText.substring(startIndex, endIndex).trim();

            const data = JSON.parse(jsonString);
            res.json({ data: data, infoUser: infoUser});
          } else if (type == "summary") {
            try {
              const prompt = `
            **Yêu cầu:**
            -Tôi muốn bạn đọc file PDF đính kèm và tóm tắt lại nội dung.\n
            -Bạn phải trả lời thành tiếng việt.
            `;
              const response = await model.generateContent([
                prompt,
                {
                  fileData: {
                    fileUri: sample_pdf.file.uri,
                    mimeType: sample_pdf.file.mimeType,
                  },
                },
              ]);

              if (response.response.usageMetadata) {
                total_token_output += response.response.usageMetadata.candidatesTokenCount;
                total_token_input += response.response.usageMetadata.promptTokenCount;
                total_token_in_and_out += response.response.usageMetadata.totalTokenCount;

                userData.cryptoToken -= response.response.usageMetadata.totalTokenCount;
                await userData.save();

                console.log(`Total Tokens: ${total_token_in_and_out}`);
                console.log(`Total Tokens Output: ${total_token_output}`);
                console.log(`Total Tokens Input: ${total_token_input}`);
              }

              const responseText = response.response.text(); // Lấy text từ response
              console.log(responseText);
              res.json({ data: responseText, statusSendFile: true, cryptoToken: userData.cryptoToken});
            } catch (e) {
              console.log(e);
              res.json({ data: "Có lỗi ở Server, vui lòng chờ sau vài phút và yêu cầu lại", statusSendFile: false });
            }
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
    res.json({ data: "Có lỗi ở Server, vui lòng chờ sau vài phút và yêu cầu lại", statusSendFile: false });
  }
});

mongoose.Promise = global.Promise;
mongoose
  .connect(MONGO_DB_CONFIG.DB)
  .then(() => console.log("DB connected"))
  .catch((error) => console.log("DB connection error:", error));

// Routes
import appRoutes from "./routers/app.routers.js"; // Sử dụng import cho routes
import { info } from "console";


app.use("/api", appRoutes);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
