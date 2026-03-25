import { Muxbir } from "./muxbir.model.js";
import { Lavha } from "./lavha.model.js";

// Muxbir va Lavhani bog'lash
Muxbir.hasMany(Lavha, { foreignKey: 'user_id' });
Lavha.belongsTo(Muxbir, { foreignKey: 'user_id' });

export { Muxbir, Lavha };