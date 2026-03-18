import pool from "../config/db.js";

export async function getAllFlats(req, res) {
  try {
    const result = await pool.query(`
      SELECT
        id,
        flat_no AS "flatNumber",
        flat_type AS "flatType",
        owner AS "ownerName",
        email
      FROM flats
      ORDER BY id ASC
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching flats:", err);
    res.status(500).json({
      message: "Failed to fetch flats!",
    });
  }
}

export const createFlat = async (req, res) => {
  try {
    const { flat_no, flat_type, owner, email } = req.body;
    const quey = `
      INSERT
      INTO 
      flats(flat_no, flat_type, owner, email)
      VALUES
      ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [flat_no, flat_type, owner, email];
    const result = await pool.query(quey, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating flats:", err);
    res.status(500).json({
      message: "Failed to create flat!",
    });
  }
};

export const updateFlat = async (req, res) => {
  try {
    const { id } = req.params;
    const { flat_no, flat_type, owner, email } = req.body;

    const result = await pool.query(
      `
      UPDATE flats
      SET flat_no = $1,
          flat_type = $2,
          owner = $3,
          email = $4
      WHERE id = $5
      RETURNING *
      `,
      [flat_no, flat_type, owner, email, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Flat not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update flat" });
  }
};

export const deleteFlat = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `DELETE FROM flats
          WHERE id= $1
          RETURNING *`,
      [id],
    );

    if (result.rows.length == 0) {
      return res.status(404).json({ message: "Flat not found!" });
    }

    res.status(200).json({ message: "Flat delete successfully!" });
  } catch (error) {
    if (error.code === "23503") {
      return res.status(400).json({
        message: "Cannot delete flat because users are assigned to it.",
      });
      console.error(error);
      res.status(500).json({ message: "Failed to delete flat!" });
      // console.log(error.message);
    }
  }
};
