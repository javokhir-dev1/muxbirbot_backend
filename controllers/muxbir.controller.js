import { Muxbir } from "../models/index.js";

export const createMuxbir = async (req, res) => {
    try {
        const { full_name, telegram, hudud } = req.body;
        const newMuxbir = await Muxbir.create({ full_name, telegram, hudud });
        res.status(201).json({ message: "Muxbir muvaffaqiyatli qo'shildi", data: newMuxbir });
    } catch (err) {
        res.status(500).json({ error: "Xatolik yuz berdi", details: err.message });
    }
};

export const getAllMuxbirlar = async (req, res) => {
    try {
        const muxbirlar = await Muxbir.findAll();
        res.json(muxbirlar);
    } catch (err) {
        res.status(500).json({ error: "Xatolik yuz berdi" });
    }
};

export const deleteMuxbir = async (req, res) => {
    try {
        const { id } = req.params;
        await Muxbir.destroy({ where: { id } });
        res.json({ message: "Muxbir o'chirildi" });
    } catch (err) {
        res.status(500).json({ error: "Xatolik yuz berdi" });
    }
};