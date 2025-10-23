import instance from "@/lib/axios";

const SHIFT_BASE_URL = "/shifts";
const ASSIGNMENT_BASE_URL = "/shift-assignments";

// ==================== SHIFT MANAGEMENT ====================

/**
 * Get all shifts
 */
export const getAllShifts = async () => {
    const response = await instance.get(SHIFT_BASE_URL);
    return response.data;
};

/**
 * Get shift by ID
 */
export const getShiftById = async (id) => {
    const response = await instance.get(`${SHIFT_BASE_URL}/${id}`);
    return response.data;
};

/**
 * Create new shift
 */
export const createShift = async (shiftData) => {
    const response = await instance.post(SHIFT_BASE_URL, shiftData);
    return response.data;
};

/**
 * Update shift
 */
export const updateShift = async (id, shiftData) => {
    const response = await instance.patch(`${SHIFT_BASE_URL}/${id}`, shiftData);
    return response.data;
};

/**
 * Delete shift
 */
export const deleteShift = async (id) => {
    const response = await instance.delete(`${SHIFT_BASE_URL}/${id}`);
    return response.data;
};

/**
 * Get staff working in a shift on a specific date
 */
export const getStaffByShiftAndDate = async (shiftId, date) => {
    const response = await instance.get(`${SHIFT_BASE_URL}/${shiftId}/staff`, {
        params: { date },
    });
    return response.data;
};

// ==================== SHIFT ASSIGNMENT MANAGEMENT ====================

/**
 * Get all shift assignments with filters
 */
export const getAllShiftAssignments = async (filters = {}) => {
    const response = await instance.get(ASSIGNMENT_BASE_URL, { params: filters });
    return response.data;
};

/**
 * Get shift assignment by ID
 */
export const getShiftAssignmentById = async (id) => {
    const response = await instance.get(`${ASSIGNMENT_BASE_URL}/${id}`);
    return response.data;
};

/**
 * Create shift assignment(s) - single or batch
 */
export const createShiftAssignment = async (assignmentData) => {
    const response = await instance.post(ASSIGNMENT_BASE_URL, assignmentData);
    return response.data;
};

/**
 * Update shift assignment
 */
export const updateShiftAssignment = async (id, assignmentData) => {
    const response = await instance.patch(`${ASSIGNMENT_BASE_URL}/${id}`, assignmentData);
    return response.data;
};

/**
 * Check-in to shift
 */
export const checkInShift = async (id) => {
    const response = await instance.post(`${ASSIGNMENT_BASE_URL}/${id}/check-in`);
    return response.data;
};

/**
 * Check-out from shift
 */
export const checkOutShift = async (id) => {
    const response = await instance.post(`${ASSIGNMENT_BASE_URL}/${id}/check-out`);
    return response.data;
};

/**
 * Delete shift assignment
 */
export const deleteShiftAssignment = async (id) => {
    const response = await instance.delete(`${ASSIGNMENT_BASE_URL}/${id}`);
    return response.data;
};

/**
 * Get user's schedule
 */
export const getUserSchedule = async (userId, startDate, endDate) => {
    const response = await instance.get(`/users/${userId}/schedule`, {
        params: { startDate, endDate },
    });
    return response.data;
};

const shiftService = {
    // Shifts
    getAllShifts,
    getShiftById,
    createShift,
    updateShift,
    deleteShift,
    getStaffByShiftAndDate,

    // Assignments
    getAllShiftAssignments,
    getShiftAssignmentById,
    createShiftAssignment,
    updateShiftAssignment,
    checkInShift,
    checkOutShift,
    deleteShiftAssignment,
    getUserSchedule,
};

export default shiftService;
