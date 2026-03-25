import { Lavha } from "../models/lavha.model.js";
import { Muxbir } from "../models/index.js";
import { Op, Sequelize } from "sequelize";

// 1. Yangi lavha qo'shish
export const addLavha = async (req, res) => {
    try {
        const { user_id, type_lavha, sana, ball } = req.body;
        const lavha = await Lavha.create({ user_id, type_lavha, sana, ball });
        res.status(201).json(lavha);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Bugun lavha berganlar (Cast qo'shildi)
export const getTodayReports = async (req, res) => {
    try {
        const { type } = req.query; 
        const today = new Date().toLocaleDateString('en-GB').replace(/\//g, '-'); 

        const reports = await Lavha.findAll({
            where: {
                type_lavha: type,
                sana: today
            },
            include: [{ 
                model: Muxbir, 
                attributes: ['full_name', 'hudud'],
                on: Sequelize.where(
                    Sequelize.cast(Sequelize.col('Lavha.user_id'), 'INTEGER'),
                    Op.eq,
                    Sequelize.col('Muxbir.id')
                )
            }]
        });

        if (reports.length === 0) {
            return res.status(404).json({ message: "Bugun lavha bergan muxbirlar topilmadi" });
        }
        res.json(reports);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Oylik statistika (Cast bilan)
export const getMonthlyStats = async (req, res) => {
    try {
        const { month } = req.query;
        const monthsArr = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
        const monthIndex = monthsArr.indexOf(month.toLowerCase()) + 1;

        if (monthIndex === 0) {
            return res.status(400).json({ error: "Noto'g'ri oy nomi kiritildi" });
        }

        const monthStr = monthIndex < 10 ? `0${monthIndex}` : `${monthIndex}`;

        const reports = await Lavha.findAll({
            where: {
                sana: { [Op.like]: `%-${monthStr}-%` }
            },
            include: [{
                model: Muxbir,
                attributes: ['full_name', 'hudud'],
                on: Sequelize.where(
                    Sequelize.cast(Sequelize.col('Lavha.user_id'), 'INTEGER'),
                    Op.eq,
                    Sequelize.col('Muxbir.id')
                )
            }]
        });

        res.json(reports);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. Eng yaxshi muxbirlar (Birlashgan va optimallashgan mantiq)
export const getBestReporter = async (req, res) => {
    try {
        const { category } = req.query;
        let filter = category === "markaz" ? { hudud: "markaz" } : { hudud: { [Op.ne]: "markaz" } };

        const muxbirlar = await Muxbir.findAll({ 
            where: filter,
            include: [{
                model: Lavha,
                required: false, // Lavhasi yo'q muxbirlar ham chiqishi uchun
                on: Sequelize.where(
                    Sequelize.cast(Sequelize.col('Muxbir.id'), 'VARCHAR'), // Muxbir ID sini String qildik
                    Op.eq,
                    Sequelize.col('Lavhas.user_id') // Lavha user_id bilan solishtirdik
                )
            }]
        });

        const summary = muxbirlar.map(m => {
            const lavhalar = m.Lavhas || []; 
            const totalBall = lavhalar.reduce((sum, l) => sum + Number(l.ball || 0), 0);
            return {
                full_name: m.full_name,
                hudud: m.hudud,
                totalBall,
                count: lavhalar.length
            };
        });

        res.json(summary.sort((a, b) => b.totalBall - a.totalBall).slice(0, 3));
    } catch (err) {
        console.error("Xatolik:", err);
        res.status(500).json({ error: err.message });
    }
};
export const getTopMuxbirlar = getBestReporter;