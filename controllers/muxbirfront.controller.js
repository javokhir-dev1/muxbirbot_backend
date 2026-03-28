import { Op } from "sequelize";
import { Muxbir } from "../models/muxbir.model.js";
import { Lavha } from "../models/lavha.model.js";

const isSameMonthByName = (dateStr, monthName) => {
    const months = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
    const [, month] = dateStr.split("-");
    return months[Number(month) - 1] === monthName.toLowerCase();
};

export const getTopMuxbirlarFront = async (req, res) => {
    try {
        const { type } = req.query; // 'markaz' yoki 'hudud'
        const whereClause = type === 'markaz' ? { hudud: 'markaz' } : { hudud: { [Op.ne]: 'markaz' } };

        const muxbirlar = await Muxbir.findAll({ where: whereClause });
        const result = [];

        for (let m of muxbirlar) {
            const lavhalar = await Lavha.findAll({ where: { user_id: String(m.id) } });
            result.push({
                id: m.id,
                full_name: m.full_name,
                count: lavhalar.length,
                total_ball: lavhalar.reduce((sum, l) => sum + Number(l.ball), 0)
            });
        }

        res.json(result.sort((a, b) => b.count - a.count));
    } catch (err) {
        res.status(500).json({ message: "Xatolik yuz berdi", error: err.message });
    }
};

export const getMuxbirStatsByTelegram = async (req, res) => {
    try {
        const { telegramId } = req.params; // Bu yerda ham ID, ham username kelishi mumkin
        const { oy } = req.query;

        // 1. Muxbirni telegram ID yoki username orqali topish
        const muxbir = await Muxbir.findOne({
            where: {
                telegram: telegramId
            }
        });

        if (!muxbir) {
            return res.status(404).json({ 
                success: false, 
                message: "Muxbir bazadan topilmadi" 
            });
        }

        // 2. Muxbirning barcha lavhalarini olish
        const lavhalar = await Lavha.findAll({
            where: { user_id: String(muxbir.id) }
        });

        // 3. Agar oy so'ralgan bo'lsa, filtrlaymiz
        const filteredLavhalar = oy 
            ? lavhalar.filter(l => isSameMonthByName(l.sana, oy)) 
            : lavhalar;

        // 4. Natijani hisoblash
        const totalBall = filteredLavhalar.reduce((sum, item) => sum + Number(item.ball || 0), 0);

        res.status(200).json({
            success: true,
            data: {
                info: muxbir,
                stats: {
                    oy: oy || "umumiy",
                    lavhalar_soni: filteredLavhalar.length,
                    umumiy_ball: totalBall
                },
                items: filteredLavhalar
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getMuxbirProfile = async (req, res) => {
    try {
        const { telegramId } = req.params;

        // 1. Muxbirni bazadan qidirish
        const muxbir = await Muxbir.findOne({
            where: { telegram: String(telegramId) },
            raw: true
        });

        if (!muxbir) {
            return res.status(404).json({ 
                success: false, 
                message: "Muxbir topilmadi" 
            });
        }

        // 2. Muxbirning umumiy lavhalar soni va ballarini hisoblash
        const lavhalar = await Lavha.findAll({
            where: { user_id: String(muxbir.id) },
            attributes: ['ball'],
            raw: true
        });

        const totalBall = lavhalar.reduce((sum, item) => sum + Number(item.ball || 0), 0);

        // 3. To'liq profil ma'lumotini yuborish
        res.status(200).json({
            success: true,
            data: {
                id: muxbir.id,
                full_name: muxbir.full_name,
                telegram: muxbir.telegram,
                hudud: muxbir.hudud,
                total_lavhalar: lavhalar.length,
                total_ball: totalBall,
                joined_at: muxbir.createdAt // Qachon ro'yxatdan o'tganligi
            }
        });

    } catch (error) {
        console.error("Profile error:", error);
        res.status(500).json({ success: false, error: "Serverda xatolik yuz berdi" });
    }
};