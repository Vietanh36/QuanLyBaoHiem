const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// ==================== MIDDLEWARE ====================
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// 👉 QUAN TRỌNG: load frontend từ public
app.use(express.static('public'));


// ==================== KẾT NỐI POSTGRESQL ====================
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Test kết nối
pool.query('SELECT NOW()')
    .then(() => console.log('✅ Connected to PostgreSQL'))
    .catch(err => console.error('❌ DB Error:', err.message));


// ==================== API ROUTES ====================

// GET: Lấy danh sách bảo hiểm
app.get('/api/baohiem', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                id,
                tenKhach,
                sdt,
                diaChi,
                ngayCap,
                ngayHetHan,
                hangBH,
                loaiXe,
                bienSo,
                vin,
                note
            FROM baohiemoto 
            ORDER BY ngayHetHan ASC
        `);

        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi lấy dữ liệu" });
    }
});


// POST: Thêm bảo hiểm
app.post('/api/baohiem', async (req, res) => {
    try {
        const {
            tenKhach, sdt, diaChi,
            ngayCap, ngayHetHan,
            hangBH, loaiXe,
            bienSo, vin, note
        } = req.body;

        await pool.query(`
            INSERT INTO baohiemoto 
            (tenKhach, sdt, diaChi, ngayCap, ngayHetHan, hangBH, loaiXe, bienSo, vin, note)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        `, [tenKhach, sdt, diaChi, ngayCap, ngayHetHan, hangBH, loaiXe, bienSo, vin, note || null]);

        res.json({ success: true, message: "Thêm thành công!" });

    } catch (err) {
        console.error(err);

        if (err.code === '23505') {
            return res.status(409).json({
                success: false,
                message: `Biển số ${req.body.bienSo} đã tồn tại`
            });
        }

        res.status(500).json({ success: false, message: "Lỗi server" });
    }
});


// DELETE: Xóa
app.delete('/api/baohiem/:id', async (req, res) => {
    try {
        await pool.query(
            'DELETE FROM baohiemoto WHERE id = $1',
            [req.params.id]
        );

        res.json({ success: true, message: "Xóa thành công!" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Lỗi xóa" });
    }
});


// ==================== START SERVER ====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server chạy tại port ${PORT}`);
});