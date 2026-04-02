const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: '*',                    // Tạm thời cho phép tất cả (sau này sẽ chỉnh)
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// ==================== KẾT NỐI POSTGRESQL ====================
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { 
        rejectUnauthorized: false 
    }
});

// Test kết nối
pool.query('SELECT NOW()')
    .then(() => console.log('✅ Connected to Neon PostgreSQL successfully!'))
    .catch(err => console.error('❌ PostgreSQL connection error:', err.message));

// ==================== API ROUTES ====================

// GET: Lấy danh sách bảo hiểm
app.get('/api/baohiem', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                id,
                tenKhach    AS "tenKhach",
                sdt         AS "sdt",
                diaChi      AS "diaChi",
                ngayCap     AS "ngayCap",
                ngayHetHan  AS "ngayHetHan",
                hangBH      AS "hangBH",
                loaiXe      AS "loaiXe",
                bienSo      AS "bienSo",
                vin         AS "vin",
                note        AS "note"
            FROM baohiemoto 
            ORDER BY ngayHetHan ASC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi lấy dữ liệu từ server" });
    }
});

// POST: Thêm bảo hiểm mới
app.post('/api/baohiem', async (req, res) => {
    try {
        const { tenKhach, sdt, diaChi, ngayCap, ngayHetHan, hangBH, loaiXe, bienSo, vin, note } = req.body;

        await pool.query(`
            INSERT INTO baohiemoto 
                (tenKhach, sdt, diaChi, ngayCap, ngayHetHan, hangBH, loaiXe, bienSo, vin, note)
            VALUES 
                ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [tenKhach, sdt, diaChi, ngayCap, ngayHetHan, hangBH, loaiXe, bienSo, vin, note || null]);

        res.json({ success: true, message: "Thêm bảo hiểm thành công!" });
    } catch (err) {
        console.error(err);
        if (err.code === '23505') {
            return res.status(409).json({ 
                success: false, 
                message: `Biển số xe ${req.body.bienSo} đã tồn tại!` 
            });
        }
        res.status(500).json({ success: false, message: "Lỗi server khi thêm dữ liệu" });
    }
});

// DELETE: Xóa bảo hiểm
app.delete('/api/baohiem/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM baohiemoto WHERE id = $1', [req.params.id]);
        res.json({ success: true, message: "Xóa thành công!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Lỗi khi xóa" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});