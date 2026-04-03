require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Kết nối Neon Postgres
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Test kết nối
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

// Lấy tất cả dữ liệu bảo hiểm
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
        console.error(err);
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
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Sửa bảo hiểm
app.put('/api/baohiem/:id', async (req, res) => {
    const { id } = req.params;
    const { 
        tenkhach, sdt, diachi, ngaycap, ngayhethan, 
        hangbh, loaixe, bienso, note 
    } = req.body;

    try {
        const result = await pool.query(`
            UPDATE baohiemoto 
            SET tenkhach = $1, sdt = $2, diachi = $3, ngaycap = $4, ngayhethan = $5,
                hangbh = $6, loaixe = $7, bienso = $8, note = $9
            WHERE id = $10
            RETURNING *
        `, [tenkhach, sdt, diachi, ngaycap, ngayhethan, hangbh, loaixe, bienso, note, id]);

        res.json({ success: true, message: 'Cập nhật thành công', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Xóa bảo hiểm
app.delete('/api/baohiem/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM baohiemoto WHERE id = $1', [id]);
        res.json({ success: true, message: 'Xóa thành công' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});