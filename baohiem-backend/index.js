// ==================== SERVER BACKEND - QUẢN LÝ BẢO HIỂM Ô TÔ ====================
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

// ====================== MIDDLEWARE ======================
app.use(cors({
    origin: '*',                    // Cho phép tất cả (dùng cho dev)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ====================== PHỤC VỤ FILE HTML TĨNH ======================
app.use(express.static(path.join(__dirname, '../public')));

// Route mặc định - mở trang chủ
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// ====================== KẾT NỐI NEON POSTGRES ======================
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// ====================== TEST KẾT NỐI ======================
app.get('/api/test', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ 
            success: true, 
            message: '✅ Backend kết nối Neon thành công!', 
            time: result.rows[0].now 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ====================== API ROUTES ======================

// Lấy tất cả bảo hiểm
app.get('/api/baohiem', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, tenkhach, sdt, diachi, ngaycap, ngayhethan, 
                   hangbh, loaixe, bienso, note 
            FROM baohiemoto 
            ORDER BY id DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Lỗi GET /api/baohiem:', err);
        res.status(500).json({ error: 'Lỗi lấy dữ liệu từ Neon' });
    }
});

// Thêm mới bảo hiểm
app.post('/api/baohiem', async (req, res) => {
    const { 
        tenkhach, sdt, diachi, ngaycap, ngayhethan, 
        hangbh, loaixe, bienso, note 
    } = req.body;

    try {
        const result = await pool.query(`
            INSERT INTO baohiemoto 
            (tenkhach, sdt, diachi, ngaycap, ngayhethan, hangbh, loaixe, bienso, note)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `, [
            tenkhach, 
            sdt, 
            diachi || '', 
            ngaycap, 
            ngayhethan, 
            hangbh, 
            loaixe, 
            bienso, 
            note || ''
        ]);

        res.status(201).json({ 
            success: true, 
            message: 'Thêm bảo hiểm thành công!', 
            data: result.rows[0] 
        });
    } catch (err) {
        console.error('Lỗi POST /api/baohiem:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ==================== SỬA BẢO HIỂM (QUAN TRỌNG - HỖ TRỢ UPDATE NOTE) ====================
app.put('/api/baohiem/:id', async (req, res) => {
    const { id } = req.params;
    const { 
        tenkhach, sdt, diachi, ngaycap, ngayhethan, 
        hangbh, loaixe, bienso, note 
    } = req.body;

    try {
        const result = await pool.query(`
            UPDATE baohiemoto 
            SET tenkhach = $1, 
                sdt = $2, 
                diachi = $3, 
                ngaycap = $4, 
                ngayhethan = $5,
                hangbh = $6, 
                loaixe = $7, 
                bienso = $8, 
                note = $9
            WHERE id = $10
            RETURNING *
        `, [
            tenkhach, 
            sdt, 
            diachi || '', 
            ngaycap, 
            ngayhethan, 
            hangbh, 
            loaixe, 
            bienso, 
            note || '', 
            id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy bảo hiểm với ID này' });
        }

        res.json({ 
            success: true, 
            message: 'Cập nhật thành công', 
            data: result.rows[0] 
        });
    } catch (err) {
        console.error('Lỗi PUT /api/baohiem/:id:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Xóa bảo hiểm
app.delete('/api/baohiem/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM baohiemoto WHERE id = $1 RETURNING id', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy bảo hiểm' });
        }

        res.json({ success: true, message: 'Xóa thành công' });
    } catch (err) {
        console.error('Lỗi DELETE /api/baohiem:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ====================== KHỞI ĐỘNG SERVER ======================
app.listen(PORT, () => {
    console.log(`🚀 Server Backend đang chạy tại port ${PORT}`);
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
    console.log(`🔗 Test API: http://localhost:${PORT}/api/test`);
});