const asyncHandler = require("express-async-handler");
const { getAllStudents, addNewStudent, getStudentDetail, setStudentStatus, updateStudent } = require("./students-service");

const handleGetAllStudents = asyncHandler(async (req, res) => {
    const query = { ...req.query };

    // fix to how the front querys the search values, since it uses "," and not "&"
    for (const key of Object.keys(query)) {
        const val = query[key];
        if (typeof val === "string" && val.includes(",") && val.includes("=")) {
            const complete_string = `${key}=${val}`;
            for (const pair of complete_string.split(",")) {
                const [k, v = ""] = pair.split("=");
                if (k) query[k.trim()] = v.trim();
            }
        }
    }

    const payload = { 
        name: query.name, 
        className: query.class, 
        section: query.section, 
        roll: query.roll
    };
    const rows = await getAllStudents(payload);

    return res.status(200).json({
        success: true,
        students: rows.map(({ total, ...r }) => r),
    });
});


const handleAddStudent = asyncHandler(async (req, res) => {
    const payload = { ...req.body };
    payload.section = (payload.section === '' ? null : payload.section);

    if (!Number.isInteger(+payload.roll)) {
        return res.status(400).json({ success: false, message: "Roll must be a number" });
    }

    const result = await addNewStudent(payload);
    return res.status(201).json({ success: true, message: result.message });
});

const handleUpdateStudent = asyncHandler(async (req, res) => {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ success: false, message: "Invalid id param." });
    }

    const payload = { ...req.body };
    payload.userId = userId;

    if (!Number.isInteger(+payload.roll)) {
        return res.status(400).json({ success: false, message: "Roll must be a number" });
    }

    const result = await updateStudent(payload);
    return res.status(200).json({ success: true, message: result.message });
});

const handleGetStudentDetail = asyncHandler(async (req, res) => {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ success: false, message: "Invalid id param." });
    }

    const student = await getStudentDetail(userId);
    return res.status(200).json(student);
});

const handleStudentStatus = asyncHandler(async (req, res) => {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({ success: false, message: "Invalid id param." });
    }

    if (typeof req.body.status !== "boolean") {
        return res.status(400).json({ success: false, message: "Invalid status." });
    }

    const result = await setStudentStatus({
        userId,
        reviewerId: req.user.id,
        status: req.body.status,
    });

    return res.status(200).json({ success: true, message: result.message });
});

module.exports = {
    handleGetAllStudents,
    handleGetStudentDetail,
    handleAddStudent,
    handleStudentStatus,
    handleUpdateStudent,
};
