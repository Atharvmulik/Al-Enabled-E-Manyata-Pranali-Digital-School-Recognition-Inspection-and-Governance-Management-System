"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
    FiChevronRight,
    FiChevronLeft,
    FiCheck,
    FiUpload,
    FiSave,
    FiSend,
    FiShield,
} from "react-icons/fi";
import { API_BASE_URL } from "@/lib/api";

// ─── School ID — replace with your auth session value ─────────────────────────
const SCHOOL_ID = "school_001";

// ─── API helpers ──────────────────────────────────────────────────────────────

async function apiPut(path: string, body: unknown): Promise<void> {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err?.detail ?? `Error ${res.status}`);
    }
}

async function apiPost(path: string, body: unknown): Promise<void> {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err?.detail ?? `Error ${res.status}`);
    }
}

async function apiDelete(path: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}${path}`, { method: "DELETE" });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err?.detail ?? `Error ${res.status}`);
    }
}

async function uploadDocument(documentType: string, file: File): Promise<void> {
    const form = new FormData();
    form.append("file", file);
    form.append("document_type", documentType);
    const res = await fetch(`${API_BASE_URL}/profile/upload-document?document_type=${documentType}`, {
        method: "POST",
        body: form,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err?.detail ?? `Error ${res.status}`);
    }
}

const steps = [
    "Basic Details",
    "Receipts and Expenditure",
    "Legal Details",
    "Location",
    "Infrastructure",
    "Staff",
    "Safety",
    "Student Capacity",
    "Vocational Education",
    "Transportation Details",
];

const LANGUAGES = [
    "01-Assamese", "02-Bengali", "03-Gujarati", "04-Hindi", "05-Kannada",
    "06-Kashmiri", "07-Konkani", "08-Malayalam", "09-Manipuri", "10-Marathi",
    "11-Nepali", "12-Odia", "13-Punjabi", "14-Sanskrit", "15-Sindhi",
    "16-Tamil", "17-Telugu", "18-Urdu", "19-English", "20-Bodo",
    "22-Dogri", "23-Khasi", "24-Garo", "25-Mizo", "26-Bhutia",
    "27-Lepcha", "28-Limboo", "29-French", "30-Hmar",
    "31-Bishnupriya Manipuri", "32-Karbi", "39-Santhali",
    "49-Bhodi (Ladakhi)", "51-Maithali", "71-Balti", "72-Purgi",
    "73-Tibetian", "97-Foreign Medium"
];

const LANGUAGES_126 = [
    "1-Assamese", "2-Bengali", "3-Gujarati", "4-Hindi", "5-Kannada",
    "6-Kashmiri", "7-Konkani", "8-Malayalam", "9-Manipuri", "10-Marathi",
    "11-Nepali", "12-Odia", "13-Punjabi", "14-Sanskrit", "15-Sindhi",
    "16-Tamil", "17-Telugu", "18-Urdu", "19-English", "20-Bodo",
    "22-Dogri", "23-Khasi", "24-Garo", "25-Mizo", "26-Bhutia",
    "27-Lepcha", "28-Limbo", "29-French", "30-Hmar", "32-Karbi",
    "39-Santhali", "41-Angami", "42-Ao", "43-Arabic", "46-German",
    "47-Kakbarak", "48-Konyak", "49-Bhoti", "50-Lotha", "51-Maithili",
    "53-Nicobaree", "54-Persian", "55-Portuguese", "56-Rajasthani",
    "57-Russian", "58-Sema", "59-Spanish", "60-Tibetan", "61-Zeliang",
    "62-Mundari", "64-Kuruk", "65-Ho", "72-Purgi", "74-Tamang",
    "75-Gurung", "76-Sherpa", "77-Rai", "78-Mangar", "79-Mukhia",
    "80-Newar", "81-Korean", "82-Japanese", "96-Alt-English",
    "101-Tangkhul", "102-Thadou", "103-Paite", "104-Zou", "105-Kom",
    "106-Vaiphei", "107-Mao", "108-Ruangmei", "109-Liangmei", "111-Gangte",
    "112-Simte", "113-Poula", "114-Anal", "115-Maring", "116-Maram",
    "117-Zeme", "118-GFC", "119-Nyishi", "120-Galo", "121-Tagin",
    "122-Wangcho", "123-Tangsa", "124-Idu", "125-Kaman", "126-Taraon",
    "127-Adi", "128-Chokri", "129-Khuzhale", "130-Chang",
    "131-Khiamuniungan", "132-Kuki", "133-Phom", "134-Pochury",
    "135-Nethenyi", "136-Nzonkhwe", "137-Sangtam", "138-Yimkhiung",
    "139-Laica", "140-Chakma", "141-Mara", "142-Apatani", "143-Singpho",
    "144-Tutsa", "145-Tai-Khamti"
];

const SUBJECT_LEVELS_3210 = [
    "1-Not Studied",
    "2-Below Secondary",
    "3-Secondary",
    "4-Higher Secondary",
    "5-Graduate",
    "6-Post Graduate",
    "7-M.Phil.",
    "8-Ph.D.",
    "9-Post Doctoral"
];

const DISABILITY_TYPES_3211 = [
    "1-Not applicable",
    "2-Locomotor Impairment",
    "3-Visual Impairment",
    "4-Hearing Impairment",
    "5-Speech & Language Impairment",
    "6-Intellectual Disability",
    "7-Mental Illness",
    "8-Autism Spectrum Disorder",
    "9-Cerebral Palsy",
    "10-Muscular Dystrophy",
    "11-Chronic Neurological Conditions",
    "12-Specific Learning Disabilities",
    "13-Multiple Sclerosis",
    "14-Thalassemia",
    "15-Hemophilia",
    "16-Sickle Cell Disease",
    "17-Multiple Disabilities Including Deaf Blindness",
    "18-Acid Attack Victim",
    "19-Parkinson's Disease",
    "20-Low Vision",
    "21-Blindness"
];

const VOCATIONAL_SECTORS = [
    "61-Agriculture",
    "62-Apparels, Made ups & Home Furnishing",
    "63-Automotive",
    "64-Beauty & Wellness",
    "65-Banking Financial Services and Insurance (BFSI)",
    "66-Construction",
    "67-Electronics & Hardware",
    "68-Healthcare",
    "69-IT-ITES",
    "70-Transportation, Logistics & Warehousing",
    "71-Power",
    "72-Media & Entertainment",
    "73-Multi-Skilling",
    "74-Retail",
    "75-Private Security",
    "76-Sports, Physical Education, Fitness & Leisure",
    "77-Telecom",
    "78- Tourism & Hospitality",
    "79-plumbing",
    "80-Others"
];

const NON_TEACHING_POSTS = [
    "1-Accountant", "2-Library Assistant", "3-Laboratory Assistant",
    "4-Laboratory Technical Assistant", "5-Head Clerk", "6-Upper Division Clerk",
    "7-Lower Division Clerk", "11-Peon/MTS", "12-Night Watchman", "13-Guard"
];

const VOCATIONAL_PROF_QUAL = [
    "51-Certificate course in concerned Vocational Sector",
    "52-Diploma in Concerned Vocational Sector",
    "53-Degree in Concerned Vocational Sector",
    "54-Any other",
    "55-None"
];

const INDUSTRY_EXPERIENCE = [
    "1-Less than 1 year",
    "2-1 to less than 2 years",
    "3-2 to less than 3 years",
    "4-3+ Years"
];

const BLOOD_GROUPS = ["1-A+", "2-A-", "3-B+", "4-B-", "5-AB+", "6-AB-", "7-O+", "8-O-", "9-Not Known"];

const MINORITY_GROUPS = [
    "1-Muslim",
    "2-Christian",
    "3-Sikh",
    "4-Buddhist",
    "5-Parsi",
    "6-Jain",
    "7-Not Applicable"
];

const ACADEMIC_STREAMS = [
    "1-Arts",
    "2-Science",
    "3-Commerce",
    "4-Vocational",
    "5-Other Streams"
];

const PREVIOUS_YEAR_STATUS = [
    "1-Studied at Current/Same School",
    "2-Studied at Other School",
    "3-Anganwadi/ ECCE Centre",
    "4-None/Not Studying"
];

const PREV_CLASS_RESULT = [
    "1-Promoted/Passed",
    "3-Not Promoted/Repeater",
    "4-Promoted/Passed without Examination",
    "6-Repeater by Choice"
];

const VOCATIONAL_EXAM_STATUS = [
    "1-Appeared and Passed",
    "2-Appeared and Not Passed",
    "3-Not Applicable",
    "4-Not Appeared"
];

const CURRENT_YEAR_RESULT = [
    "1-Promoted/Passed",
    "3-Detained/Repeater/Not Passed",
    "4-Promoted/Passed without Examination",
    "5-Dropout from School",
    "6-Repeater by Choice"
];

const RESIDENCE_DISTANCE = [
    "1 - Less than 1 Km",
    "2 - Between 1-3 Kms",
    "3 - Between 3-5 Kms",
    "4 - More than 5 Kms"
];

const GUARDIAN_EDUCATION = [
    "1-Primary",
    "2-Upper Primary",
    "3-Secondary or Equivalent",
    "4-Higher Secondary or Equivalent",
    "5-More than Higher Secondary",
    "6-No Schooling Experience"
];

const SLD_TYPES = [
    "1-Dysgraphia",
    "2-Dyscalculia",
    "3-Dyslexia"
];

const GENERAL_FACILITIES = [
    "1-Free Text Book",
    "2-Free Uniforms",
    "3-Free Transport facility",
    "4-Free Bi-Cycle",
    "5-Free Hostel",
    "6-Free Escort",
    "7-Free Mobile/ Tablet/ Computer",
    "8-Other"
];

const CWSN_FACILITIES = [
    "1-Braille Book",
    "2-Braille Kit",
    "3-Braces",
    "4-Tri-cycle",
    "5-Stipend",
    "6-Crutches",
    "7-Caliper",
    "8-Low Vision Kit",
    "9-Hearing Aid",
    "10-Wheel Chair",
    "11-Escort",
    "12-Other"
];

// Type definitions
type VocationalRow = {
    grade: string;
    sector: string;
    jobRole: string;
    yearStarting: string;
};

type AnganwadiRow = {
    code: string;
    name: string;
    boys: string;
    girls: string;
};

type MultiClassRow = {
    classes: string;
};

type Sec156Row = {
    prePrimary: string;
    primary: string;
    upperPrimary: string;
    secondary: string;
    higherSecondary: string;
};

type NonTeachingStaff = {
    id: string;
    name: string;
    gender: string;
    dob: string;
    stateCode: string;
    socialCategory: string;
    academicLevel: string;
    degree: string;
    mobile: string;
    email: string;
    aadhaarNumber: string;
    aadhaarName: string;
    disability: string;
    natureOfAppointment: string;
    dateJoiningService: string;
    dateJoiningSchool: string;
    currentPost: string;
};

type VocationalStaff = {
    id: string;
    name: string;
    gender: string;
    dob: string;
    vtpCode: string;
    socialCategory: string;
    academicLevel: string;
    degree: string;
    professionalQual: string;
    mobile: string;
    email: string;
    aadhaarNumber: string;
    aadhaarName: string;
    disability: string;
    natureOfAppointment: string;
    dateJoiningService: string;
    dateJoiningSchool: string;
    typeOfTeacher: string;
    classesTaught: string;
    sector: string;
    jobRole: string;
    experience: string;
    receivedInduction: string;
};

type Sec157Row = {
    assessment: string;
    enrichment: string;
    cyber: string;
    psycho: string;
};

type GrantsRow = {
    grantName: string;
    receipt: string;
    expenditure: string;
};

type AssistanceRow = {
    source: string;
    isReceived: string;
    name: string;
    amount: string;
};

type VocationalLabRow = {
    sector: string;
    condition: string;
    separateRoom: string;
};

type DigitalEquipRow = {
    name: string;
    total: string;
    pedagogical: string;
};

type DigitalFacilityRow = {
    name: string;
    availability: string;
};

type StaffCountRow = {
    regular: string;
    nonRegular: string;
    nonTeaching: string;
    vocational: string;
};

type StaffRequiredRow = {
    prePrimary: string;
    primary: string;
    upperPrimary: string;
    secondary: string;
    higherSecondary: string;
};

type SectionConfig = {
    className: string;
    numberOfSections: number;
    sectionNames: string[];
};

type StudentProfile = {
    id: string;
    name: string;
    gender: string;
    dob: string;
    motherName: string;
    fatherName: string;
    guardianName: string;
    aadhaarNumber: string;
    aadhaarName: string;
    address: string;
    pincode: string;
    mobile: string;
    alternateMobile: string;
    email: string;
    motherTongue: string;
    socialCategory: string;
    minorityGroup: string;
    isBPL: string;
    isAAY: string;
    isEWS: string;
    isCWSN: string;
    impairmentType: string;
    hasDisabilityCertificate: string;
    isIndianNational: string;
    outOfSchoolChild: string;
    mainstreamingYear: string;
    bloodGroup: string;
    // Section 4.2: Enrolment Details
    academicYear: string;
    schoolUdiseCode: string;
    studentGrade: string;
    studentNationalCode: string;
    studentSection: string;
    rollNumber: string;
    admissionNumber: string;
    admissionDate: string;
    instructionMedium: string;
    languageGroup: string;
    academicStream: string;
    prevYearStatus: string;
    prevYearGrade: string;
    isAdmittedRTE: string;
    rteAmountClaimed: string;
    prevClassResult: string;
    prevClassMarks: string;
    prevYearAttendance: string;
    // Section 4.3: Facility & Other Details
    hasFacilities: string;
    facilitiesReceived: string[];
    hasCWSNFacilities: string;
    cwsnFacilitiesReceived: string[];
    screenedSLD: string;
    sldType: string;
    screenedASD: string;
    screenedADHD: string;
    isGifted: string;
    appearedCompetitions: string;
    participatesNCC: string;
    digitalCapable: string;
    height: string;
    weight: string;
    distanceToSchool: string;
    guardianEducation: string;
    // Section 4.4: Vocational
    undertookVocational: string;
    vocationalTrade: string;
    vocationalJobRole: string;
    vocationalPrevClassExam: string;
    vocationalPrevClassMarks: string;
    // Section 4.5: Current Year Assessment
    currentYearResult: string;
    currentYearMarks: string;
    currentYearAttendance: string;
};

type TeacherDetail = {
    id: string;
    name: string;
    gender: string;
    dob: string;
    socialCategory: string;
    isCWSN: string;
    disability: string;
    academicLevel: string;
    academicDegree: string;
    professionalQual: string;
    nationalCode: string;
    teacherCodeState: string;
    mobile: string;
    email: string;
    aadhaarNumber: string;
    aadhaarName: string;
    crrNumber: string;
    subjectLevelMath: string;
    subjectLevelScience: string;
    subjectLevelEnglish: string;
    subjectLevelSocialScience: string;
    subjectLevelLanguage: string;
    natureOfAppointment: string;
    teacherType: string;
    appointedLevel: string;
    classesTaught: string;
    dateJoiningService: string;
    dateJoiningPresentSchool: string;
    appointedForSubject: string;
    mainSubject1: string;
    mainSubject2: string;
    isDeputation: string;
    isGuestContractual: string;
    trainingNeeded: string[];
    trainingReceived: string[];
    languages: string[];
    // HS Mastery
    hsMasteryPhysics: string;
    hsMasteryChemistry: string;
    hsMasteryBiology: string;
    hsMasteryMath: string;
    // Part C Training & Skills
    trainedCWSN: string;
    trainedComputer: string;
    isNishthaTrained: string;
    nonTeachingDays: string;
    trainedSafety: string;
    trainedCyberSafety: string;
    trainedCWSNIdentification: string;
    isTETQualified: string;
    tetYear: string;
    isCapableDigital: string;
};

const ACADEMIC_LEVELS = [
    "1-Below Secondary",
    "2-Secondary",
    "3-Higher Secondary",
    "4-Graduate",
    "5-Post Graduate",
    "6-M.Phil.",
    "7-Ph.D.",
    "8-Post Doctoral"
];

const ACADEMIC_DEGREES: { [key: string]: string[] } = {
    "4-Graduate": ["B.A", "B.Sc", "B.Com", "BBA", "BCA", "B.Tech", "B.E.", "LLB", "MBBS", "Others"],
    "5-Post Graduate": ["M.A", "M.Sc", "M.Com", "MBA", "MCA", "M.Tech", "ME", "Others"],
};

const PROFESSIONAL_QUALIFICATIONS = [
    "1-Diploma or certificate in basic teachers' training (>= 2 years)",
    "2-Bachelor of Elementary Education (B.El.Ed.)",
    "3-B.Ed. or equivalent",
    "4-M.Ed. or equivalent",
    "5-Others",
    "6-None",
    "7-Diploma/degree in special education",
    "8-Pursuing any relevant professional course",
    "10-Diploma in Elementary Education (D.El.Ed.)",
    "11-Diploma in Nursery Teacher Education (NTT)",
    "12-B. Ed (Nursery)"
];

const TEACHER_TYPES = [
    "1-Head teacher",
    "2-Acting Head teacher",
    "3-Teacher",
    "5-Instructor positioned as per RTE",
    "6-Principal",
    "7-Vice Principal",
    "8-Lecturer"
];

const APPOINTED_LEVELS = [
    "1-PRT/Primary Teacher",
    "2-TGT/Trained Graduate Teacher",
    "3-PGT/Post Graduate Teacher",
    "4-Head Master/Principal",
    "6-Asst. Head Master/Vice Principal",
    "7-NTT/Pre-Primary Teacher"
];

const SUBJECTS_LIST = [
    "1-All Subjects",
    "3-Mathematics", "4-Environment Studies", "5-Sports", "6-Music", "7-Science", "8-Social Studies",
    "10-Accountancy", "11-Biology", "12-Business Studies", "13-Chemistry", "14-Computer Science",
    "15-Economics", "16-Engineering Drawing", "17-Fine Arts", "18-Geography", "19-History",
    "20-Home Science", "21-Philosophy", "22-Physics", "23-Political Science", "24-Psychology",
    "25-Foreign Language", "26-Botany", "27-Zoology", "41-Hindi", "43-Sanskrit", "45-Urdu",
    "46-English", "47-Regional Language", "52-Sociology", "91-Art Education", "92-Health & Physical Education",
    "93-Work Education", "99-Other"
];

const TRAINING_LIST = [
    "1-Subject knowledge",
    "2-Pedagogical issues",
    "3-ICT Skills",
    "4-Knowledge and skills to engage with CWSN",
    "5-Leadership and management skills",
    "6-Sanitation & Hygiene",
    "7-Others",
    "8-Not required"
];

export default function ProfilePage() {
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [showValidationPopup, setShowValidationPopup] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [schoolName, setSchoolName] = useState("");
    const [udiseNumber, setUdiseNumber] = useState("");
    const [estYear, setEstYear] = useState("");
    const [boardAffiliation, setBoardAffiliation] = useState("");
    const [stdCode, setStdCode] = useState("");
    const [landline, setLandline] = useState("");
    const [mobile, setMobile] = useState("");
    const [email, setEmail] = useState("");
    const [website, setWebsite] = useState("");
    const [subManagement, setSubManagement] = useState("");
    const [isPmShri, setIsPmShri] = useState("");
    const [schoolType, setSchoolType] = useState("");
    const [lowestClass, setLowestClass] = useState("");
    const [highestClass, setHighestClass] = useState("");
    const [locationType, setLocationType] = useState("");
    const [managementGroup, setManagementGroup] = useState("");
    const [managementCode, setManagementCode] = useState("");
    const [classification, setClassification] = useState("");
    const [applicationType, setApplicationType] = useState("New Recognition");
    const [schoolCategory, setSchoolCategory] = useState("");

    // Section 3: Staff State
    const [staffCounts, setStaffCounts] = useState<StaffCountRow>({
        regular: "",
        nonRegular: "",
        nonTeaching: "",
        vocational: ""
    });
    const [staffRequired, setStaffRequired] = useState<StaffRequiredRow>({
        prePrimary: "",
        primary: "",
        upperPrimary: "",
        secondary: "",
        higherSecondary: ""
    });
    const [teachers, setTeachers] = useState<TeacherDetail[]>([]);
    const [isAddingTeacher, setIsAddingTeacher] = useState(false);
    const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
    const [currentTeacher, setCurrentTeacher] = useState<TeacherDetail>({
        id: "",
        name: "",
        gender: "",
        dob: "",
        socialCategory: "",
        isCWSN: "2-No",
        disability: "1-Not applicable",
        academicLevel: "",
        academicDegree: "",
        professionalQual: "",
        nationalCode: "",
        teacherCodeState: "",
        mobile: "",
        email: "",
        aadhaarNumber: "",
        aadhaarName: "",
        crrNumber: "",
        subjectLevelMath: "1-Not Studied",
        subjectLevelScience: "1-Not Studied",
        subjectLevelEnglish: "1-Not Studied",
        subjectLevelSocialScience: "1-Not Studied",
        subjectLevelLanguage: "1-Not Studied",
        natureOfAppointment: "",
        teacherType: "",
        appointedLevel: "",
        classesTaught: "",
        dateJoiningService: "",
        dateJoiningPresentSchool: "",
        appointedForSubject: "",
        mainSubject1: "",
        mainSubject2: "",
        isDeputation: "2-No",
        isGuestContractual: "2-No",
        trainingNeeded: [],
        trainingReceived: [],
        languages: [],
        hsMasteryPhysics: "1-Below Secondary",
        hsMasteryChemistry: "1-Below Secondary",
        hsMasteryBiology: "1-Below Secondary",
        hsMasteryMath: "1-Below Secondary",
        // Part C Training & Skills
        trainedCWSN: "2-No",
        trainedComputer: "2-No",
        isNishthaTrained: "2-No",
        nonTeachingDays: "0",
        trainedSafety: "2-No",
        trainedCyberSafety: "2-No",
        trainedCWSNIdentification: "2-No",
        isTETQualified: "2-No",
        tetYear: "",
        isCapableDigital: "2-No",
    });

    const [hasPrePrimary, setHasPrePrimary] = useState("");

    // Section 4: Student Capacity - Section Details
    const [sectionConfigs, setSectionConfigs] = useState<SectionConfig[]>([]);
    const [isSectionConfigSaved, setIsSectionConfigSaved] = useState(false);

    // Section 4.B: Student Profile State
    const [students, setStudents] = useState<StudentProfile[]>([]);
    const [isAddingStudent, setIsAddingStudent] = useState(false);
    const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
    const [currentStudent, setCurrentStudent] = useState<StudentProfile>({
        id: "",
        name: "",
        gender: "",
        dob: "",
        motherName: "",
        fatherName: "",
        guardianName: "",
        aadhaarNumber: "",
        aadhaarName: "",
        address: "",
        pincode: "",
        mobile: "",
        alternateMobile: "",
        email: "",
        motherTongue: "19-English",
        socialCategory: "1-General",
        minorityGroup: "7-Not Applicable",
        isBPL: "2-No",
        isAAY: "2-No",
        isEWS: "2-No",
        isCWSN: "2-No",
        impairmentType: "1-Not applicable",
        hasDisabilityCertificate: "2-No",
        isIndianNational: "1-Yes",
        outOfSchoolChild: "2-No",
        mainstreamingYear: "",
        bloodGroup: "9-Not Known",
        // Enrolment
        academicYear: "2024-25",
        schoolUdiseCode: "",
        studentGrade: "",
        studentNationalCode: "",
        studentSection: "A",
        rollNumber: "",
        admissionNumber: "",
        admissionDate: "",
        instructionMedium: "",
        languageGroup: "",
        academicStream: "",
        prevYearStatus: "1-Studied at Current/Same School",
        prevYearGrade: "",
        isAdmittedRTE: "2-No",
        rteAmountClaimed: "",
        prevClassResult: "",
        prevClassMarks: "",
        prevYearAttendance: "",
        // Facilities
        hasFacilities: "2-No",
        facilitiesReceived: [],
        hasCWSNFacilities: "2-No",
        cwsnFacilitiesReceived: [],
        screenedSLD: "2-No",
        sldType: "",
        screenedASD: "2-No",
        screenedADHD: "2-No",
        isGifted: "2-No",
        appearedCompetitions: "2-No",
        participatesNCC: "2-No",
        digitalCapable: "2-No",
        height: "",
        weight: "",
        distanceToSchool: "",
        guardianEducation: "",
        // Section 4.4: Vocational
        undertookVocational: "2-No",
        vocationalTrade: "",
        vocationalJobRole: "",
        vocationalPrevClassExam: "3-Not Applicable",
        vocationalPrevClassMarks: "",
        // Section 4.5: Current Year Assessment
        currentYearResult: "",
        currentYearMarks: "",
        currentYearAttendance: ""
    });

    const handleEditTeacher = (teacher: TeacherDetail) => {
        setCurrentTeacher(teacher);
        setEditingTeacherId(teacher.id);
        setIsAddingTeacher(true);
    };

    const handleSaveTeacher = () => {
        if (!currentTeacher.name) {
            alert("Teacher name is mandatory.");
            return;
        }
        if (editingTeacherId) {
            setTeachers(teachers.map((t) => (t.id === editingTeacherId ? currentTeacher : t)));
            setEditingTeacherId(null);
        } else {
            setTeachers([...teachers, { ...currentTeacher, id: Math.random().toString(36).substr(2, 9) }]);
        }
        setIsAddingTeacher(false);
        setCurrentTeacher({
            id: "",
            name: "",
            gender: "1-Male",
            dob: "",
            socialCategory: "1-General",
            isCWSN: "2-No",
            disability: "1-Not applicable",
            academicLevel: "",
            academicDegree: "",
            professionalQual: "",
            nationalCode: "",
            teacherCodeState: "",
            mobile: "",
            email: "",
            aadhaarNumber: "",
            aadhaarName: "",
            crrNumber: "",
            subjectLevelMath: "1-Not Studied",
            subjectLevelScience: "1-Not Studied",
            subjectLevelEnglish: "1-Not Studied",
            subjectLevelSocialScience: "1-Not Studied",
            subjectLevelLanguage: "1-Not Studied",
            natureOfAppointment: "",
            teacherType: "",
            appointedLevel: "",
            classesTaught: "",
            dateJoiningService: "",
            dateJoiningPresentSchool: "",
            appointedForSubject: "",
            mainSubject1: "",
            mainSubject2: "",
            isDeputation: "2-No",
            isGuestContractual: "2-No",
            trainingNeeded: [],
            trainingReceived: [],
            languages: [],
            hsMasteryPhysics: "1-Below Secondary",
            hsMasteryChemistry: "1-Below Secondary",
            hsMasteryBiology: "1-Below Secondary",
            hsMasteryMath: "1-Below Secondary",
            // Part C Training & Skills
            trainedCWSN: "2-No",
            trainedComputer: "2-No",
            isNishthaTrained: "2-No",
            nonTeachingDays: "0",
            trainedSafety: "2-No",
            trainedCyberSafety: "2-No",
            trainedCWSNIdentification: "2-No",
            isTETQualified: "2-No",
            tetYear: "",
            isCapableDigital: "2-No",
        });
    };

    const handleDeleteTeacher = async (id: string) => {
        setTeachers(teachers.filter(t => t.id !== id)); // optimistic
        try { await apiDelete(`/profile/staff/teachers/${id}`); } catch { /* ignore */ }
    };

    const handleSaveNonTeachingStaff = () => {
        if (!currentNonTeachingStaff.name) {
            alert("Name is mandatory for non-teaching staff.");
            return;
        }
        if (editingNonTeachingId) {
            setNonTeachingStaff(nonTeachingStaff.map(s => s.id === editingNonTeachingId ? currentNonTeachingStaff : s));
            setEditingNonTeachingId(null);
        } else {
            setNonTeachingStaff([...nonTeachingStaff, { ...currentNonTeachingStaff, id: Math.random().toString(36).substr(2, 9) }]);
        }
        setIsAddingNonTeaching(false);
        setCurrentNonTeachingStaff({
            id: "", name: "", gender: "1-Male", dob: "", stateCode: "", socialCategory: "1-General",
            academicLevel: "1-Below Secondary", degree: "", mobile: "", email: "",
            aadhaarNumber: "", aadhaarName: "", disability: "1-Not applicable",
            natureOfAppointment: "1-Regular", dateJoiningService: "", dateJoiningSchool: "",
            currentPost: "1-Accountant"
        } as any);
    };

    const handleDeleteNonTeachingStaff = async (id: string) => {
        setNonTeachingStaff(nonTeachingStaff.filter(s => s.id !== id));
        try { await apiDelete(`/profile/staff/non-teaching/${id}`); } catch { /* ignore */ }
    };

    // Student Handlers
    const handleSaveStudent = () => {
        if (!currentStudent.name) {
            alert("Student name is mandatory.");
            return;
        }
        if (editingStudentId) {
            setStudents(students.map((s) => (s.id === editingStudentId ? currentStudent : s)));
            setEditingStudentId(null);
        } else {
            setStudents([...students, { ...currentStudent, id: Math.random().toString(36).substr(2, 9) }]);
        }
        setIsAddingStudent(false);
        // Reset currentStudent state
        setCurrentStudent({
            id: "",
            name: "",
            gender: "",
            dob: "",
            motherName: "",
            fatherName: "",
            guardianName: "",
            aadhaarNumber: "",
            aadhaarName: "",
            address: "",
            pincode: "",
            mobile: "",
            alternateMobile: "",
            email: "",
            motherTongue: "19-English",
            socialCategory: "1-General",
            minorityGroup: "7-Not Applicable",
            isBPL: "2-No",
            isAAY: "2-No",
            isEWS: "2-No",
            isCWSN: "2-No",
            impairmentType: "1-Not applicable",
            hasDisabilityCertificate: "2-No",
            isIndianNational: "1-Yes",
            outOfSchoolChild: "2-No",
            mainstreamingYear: "",
            bloodGroup: "9-Not Known",
            // Enrolment
            academicYear: "2024-25",
            schoolUdiseCode: "",
            studentGrade: "",
            studentNationalCode: "",
            studentSection: "A",
            rollNumber: "",
            admissionNumber: "",
            admissionDate: "",
            instructionMedium: "",
            languageGroup: "",
            academicStream: "",
            prevYearStatus: "1-Studied at Current/Same School",
            prevYearGrade: "",
            isAdmittedRTE: "2-No",
            rteAmountClaimed: "",
            prevClassResult: "",
            prevClassMarks: "",
            prevYearAttendance: "",
            // Facilities
            hasFacilities: "2-No",
            facilitiesReceived: [],
            hasCWSNFacilities: "2-No",
            cwsnFacilitiesReceived: [],
            screenedSLD: "2-No",
            sldType: "",
            screenedASD: "2-No",
            screenedADHD: "2-No",
            isGifted: "2-No",
            appearedCompetitions: "2-No",
            participatesNCC: "2-No",
            digitalCapable: "2-No",
            height: "",
            weight: "",
            distanceToSchool: "",
            guardianEducation: "",
            // Section 4.4: Vocational
            undertookVocational: "2-No",
            vocationalTrade: "",
            vocationalJobRole: "",
            vocationalPrevClassExam: "3-Not Applicable",
            vocationalPrevClassMarks: "",
            // Section 4.5: Current Year Assessment
            currentYearResult: "",
            currentYearMarks: "",
            currentYearAttendance: ""
        });
    };

    const handleEditStudent = (student: StudentProfile) => {
        setCurrentStudent(student);
        setEditingStudentId(student.id);
        setIsAddingStudent(true);
    };

    const handleDeleteStudent = async (id: string) => {
        if (confirm("Are you sure you want to delete this student profile?")) {
            setStudents(students.filter((s) => s.id !== id));
            try { await apiDelete(`/profile/students/${id}`); } catch { /* ignore */ }
        }
    };

    const handleSaveVocationalStaff = () => {
        if (!currentVocationalStaff.name) {
            alert("Name is mandatory for vocational resource person.");
            return;
        }
        if (editingVocationalId) {
            setVocationalStaff(vocationalStaff.map(s => s.id === editingVocationalId ? currentVocationalStaff : s));
            setEditingVocationalId(null);
        } else {
            setVocationalStaff([...vocationalStaff, { ...currentVocationalStaff, id: Math.random().toString(36).substr(2, 9) }]);
        }
        setIsAddingVocational(false);
        setCurrentVocationalStaff({
            id: "", name: "", gender: "1-Male", dob: "", vtpCode: "", socialCategory: "1-General",
            academicLevel: "1-Below Secondary", degree: "", professionalQual: "55-None",
            mobile: "", email: "", aadhaarNumber: "", aadhaarName: "",
            disability: "1-Not applicable", natureOfAppointment: "1-Regular",
            dateJoiningService: "", dateJoiningSchool: "", typeOfTeacher: "1-Resource Person",
            classesTaught: "5-Secondary only", sector: "69-IT-ITES", jobRole: "",
            experience: "1-Less than 1 year", receivedInduction: "2-No"
        });
    };

    const handleDeleteVocationalStaff = async (id: string) => {
        setVocationalStaff(vocationalStaff.filter(s => s.id !== id));
        try { await apiDelete(`/profile/staff/vocational/${id}`); } catch { /* ignore */ }
    };

    const [nonTeachingStaff, setNonTeachingStaff] = useState<NonTeachingStaff[]>([]);
    const [currentNonTeachingStaff, setCurrentNonTeachingStaff] = useState<NonTeachingStaff>({
        id: "", name: "", gender: "1-Male", dob: "", stateCode: "", socialCategory: "1-General",
        academicLevel: "1-Below Secondary", degree: "", mobile: "", email: "",
        aadhaarNumber: "", aadhaarName: "", disability: "1-Not applicable",
        natureOfAppointment: "1-Regular", dateJoiningService: "", dateJoiningSchool: "",
        currentPost: "1-Accountant"
    } as any);
    const [isAddingNonTeaching, setIsAddingNonTeaching] = useState(false);
    const [editingNonTeachingId, setEditingNonTeachingId] = useState<string | null>(null);

    const [vocationalStaff, setVocationalStaff] = useState<VocationalStaff[]>([]);
    const [currentVocationalStaff, setCurrentVocationalStaff] = useState<VocationalStaff>({
        id: "", name: "", gender: "1-Male", dob: "", vtpCode: "", socialCategory: "1-General",
        academicLevel: "1-Below Secondary", degree: "", professionalQual: "55-None",
        mobile: "", email: "", aadhaarNumber: "", aadhaarName: "",
        disability: "1-Not applicable", natureOfAppointment: "1-Regular",
        dateJoiningService: "", dateJoiningSchool: "", typeOfTeacher: "1-Resource Person",
        classesTaught: "5-Secondary only", sector: "69-IT-ITES", jobRole: "",
        experience: "1-Less than 1 year", receivedInduction: "2-No"
    });
    const [isAddingVocational, setIsAddingVocational] = useState(false);
    const [editingVocationalId, setEditingVocationalId] = useState<string | null>(null);

    const [activeStaffTab, setActiveStaffTab] = useState<"teaching" | "non-teaching" | "vocational">("teaching");

    const [curriculumPrimary, setCurriculumPrimary] = useState("");
    const [curriculumUpperPrimary, setCurriculumUpperPrimary] = useState("");
    const [isMinority, setIsMinority] = useState("");
    const [minorityCommunity, setMinorityCommunity] = useState("");
    const [isRTE, setIsRTE] = useState("");
    const [isVocational, setIsVocational] = useState("");
    const [fundingSource, setFundingSource] = useState("");
    const [sanctionOrderNumber, setSanctionOrderNumber] = useState("");
    const [vocationalRows, setVocationalRows] = useState<VocationalRow[]>(
        Array(8).fill(null).map(() => ({
            grade: "",
            sector: "",
            jobRole: "",
            yearStarting: ""
        }))
    );
    const [isPreVocational, setIsPreVocational] = useState("");
    const [isSkillCenter, setIsSkillCenter] = useState("");
    const [isResidential, setIsResidential] = useState("");
    const [residentialType, setResidentialType] = useState("");
    const [isShift, setIsShift] = useState("");
    const [isMotherTongue, setIsMotherTongue] = useState("");
    const [distPrimary, setDistPrimary] = useState("");
    const [distUpperPrimary, setDistUpperPrimary] = useState("");
    const [distSecondary, setDistSecondary] = useState("");
    const [distHigherSecondary, setDistHigherSecondary] = useState("");
    const [isAllWeatherRoad, setIsAllWeatherRoad] = useState("");
    const [instructionalDays, setInstructionalDays] = useState("");
    const [isCCE, setIsCCE] = useState("");
    const [isRecordsMaintained, setIsRecordsMaintained] = useState("");
    const [isRecordsShared, setIsRecordsShared] = useState("");

    // Section 1.40 - 1.47 State Variables
    const [hasAnganwadi, setHasAnganwadi] = useState("");
    const [anganwadiCentersCount, setAnganwadiCentersCount] = useState("");
    const [anganwadiRows, setAnganwadiRows] = useState<AnganwadiRow[]>(
        Array(3).fill(null).map(() => ({ code: "", name: "", boys: "", girls: "" }))
    );
    const [hasBalavatika, setHasBalavatika] = useState("");
    const [hasOoSC, setHasOoSC] = useState("");
    const [hasOoSCST, setHasOoSCST] = useState("");
    const [remedialStudents, setRemedialStudents] = useState("");
    const [learningEnhancementStudents, setLearningEnhancementStudents] = useState("");
    const [academicInspections, setAcademicInspections] = useState("");
    const [crcVisits, setCrcVisits] = useState("");
    const [brcVisits, setBrcVisits] = useState("");
    const [districtVisits, setDistrictVisits] = useState("");
    const [regionalVisits, setRegionalVisits] = useState("");
    const [hqVisits, setHqVisits] = useState("");
    const [hasSMC, setHasSMC] = useState("");
    const [hasSDMC, setHasSDMC] = useState("");
    const [smcMeetings, setSmcMeetings] = useState("");
    const [hasSMCPlan, setHasSMCPlan] = useState("");
    const [smcPlanYear, setSmcPlanYear] = useState("");
    const [hasSBC, setHasSBC] = useState("");
    const [hasAC, setHasAC] = useState("");
    const [hasPTA, setHasPTA] = useState("");
    const [ptaMeetings, setPtaMeetings] = useState("");

    // Section 1.48 - 1.55 State Variables
    const [hasPFMS, setHasPFMS] = useState("");
    const [pfmsId, setPfmsId] = useState("");
    const [hasMultiClass, setHasMultiClass] = useState("");
    const [multiClassRows, setMultiClassRows] = useState<MultiClassRow[]>(
        Array(3).fill(null).map(() => ({ classes: "" }))
    );
    const [isSchoolComplex, setIsSchoolComplex] = useState("");
    const [isHubSchool, setIsHubSchool] = useState("");
    const [complexPrePrimary, setComplexPrePrimary] = useState("");
    const [complexPrimary, setComplexPrimary] = useState("");
    const [complexUpperPrimary, setComplexUpperPrimary] = useState("");
    const [complexSecondary, setComplexSecondary] = useState("");
    const [complexHigherSecondary, setComplexHigherSecondary] = useState("");
    const [complexTotal, setComplexTotal] = useState("");

    const [hasEBSB, setHasEBSB] = useState("");
    const [hasFitIndia, setHasFitIndia] = useState("");
    const [hasHolisticReportCard, setHasHolisticReportCard] = useState("");

    const [pmPoshanTotalDays, setPmPoshanTotalDays] = useState("");
    const [pmPoshanDaysPerWeek, setPmPoshanDaysPerWeek] = useState("");
    const [pmPoshanDaysPerMonth, setPmPoshanDaysPerMonth] = useState("");
    const [pmPoshanBalvatika, setPmPoshanBalvatika] = useState("");

    // Section 1.56 & 1.57 State Variables
    const [hasAgreedToFirstYearActivities, setHasAgreedToFirstYearActivities] = useState(false);
    const [sec156, setSec156] = useState<Sec156Row[]>(
        Array(8).fill(null).map(() => ({
            prePrimary: "",
            primary: "",
            upperPrimary: "",
            secondary: "",
            higherSecondary: ""
        }))
    );
    const [sec157, setSec157] = useState<Sec157Row[]>(
        Array(12).fill(null).map(() => ({
            assessment: "",
            enrichment: "",
            cyber: "",
            psycho: ""
        }))
    );

    // Section 1.58 State Variables
    const [hasDisasterPlan, setHasDisasterPlan] = useState("");
    const [hasStructuralAudit, setHasStructuralAudit] = useState("");
    const [hasNonStructuralAudit, setHasNonStructuralAudit] = useState("");
    const [hasCCTV, setHasCCTV] = useState("");
    const [hasFireExtinguishers, setHasFireExtinguishers] = useState("");
    const [hasNodalTeacher, setHasNodalTeacher] = useState("");
    const [hasSafetyTraining, setHasSafetyTraining] = useState("");
    const [safetyTrainingDate, setSafetyTrainingDate] = useState("");
    const [disasterManagementTaught, setDisasterManagementTaught] = useState("");

    // Girls Self Defence
    const [hasSelfDefenceGrant, setHasSelfDefenceGrant] = useState("");
    const [selfDefenceUpperPrimary, setSelfDefenceUpperPrimary] = useState("");
    const [selfDefenceSecondary, setSelfDefenceSecondary] = useState("");
    const [selfDefenceHigherSecondary, setSelfDefenceHigherSecondary] = useState("");

    const [hasSafetyDisplayBoard, setHasSafetyDisplayBoard] = useState("");
    const [hasFirstLevelCounselor, setHasFirstLevelCounselor] = useState("");
    const [safetyAuditFrequency, setSafetyAuditFrequency] = useState("");

    const [hasTeacherPhotos, setHasTeacherPhotos] = useState("");
    const [hasVidyaPravesh, setHasVidyaPravesh] = useState("");

    const [studentAttendanceCapture, setStudentAttendanceCapture] = useState("");
    const [teacherAttendanceCapture, setTeacherAttendanceCapture] = useState("");

    const [hasYouthClub, setHasYouthClub] = useState("");
    const [hasEcoClub, setHasEcoClub] = useState("");
    const [hasTeacherID, setHasTeacherID] = useState("");
    const [sssaCertification, setSssaCertification] = useState("");

    // Section 1.59 & 1.60 State Variables
    const [grants, setGrants] = useState<GrantsRow[]>([
        { grantName: "1.59.1 Composite School Grant", receipt: "", expenditure: "" },
        { grantName: "1.59.2 Library Grant", receipt: "", expenditure: "" },
        { grantName: "1.59.3 Grant for Major Repair", receipt: "", expenditure: "" },
        { grantName: "1.59.4 Grant for Sports and Physical Education", receipt: "", expenditure: "" },
        { grantName: "1.59.5 Grant for Media and Community Mobilization", receipt: "", expenditure: "" },
        { grantName: "1.59.6 Grant for Training of SMC/SMDC", receipt: "", expenditure: "" },
        { grantName: "1.59.7 Grant for support at Preschool Level", receipt: "", expenditure: "" },
    ]);
    const [assistance, setAssistance] = useState<AssistanceRow[]>([
        { source: "1.60.1 Non-Govt. Organization (NGO)", isReceived: "", name: "", amount: "" },
        { source: "1.60.2 Public Sector Undertaking (PSU)", isReceived: "", name: "", amount: "" },
        { source: "1.60.3 Community", isReceived: "", name: "", amount: "" },
        { source: "1.60.4 Other", isReceived: "", name: "", amount: "" },
    ]);

    // Section 1.61 State Variables
    const [hasIctRegister, setHasIctRegister] = useState("");
    const [hasSportsRegister, setHasSportsRegister] = useState("");
    const [hasLibraryRegister, setHasLibraryRegister] = useState("");
    const [ictRegisterDate, setIctRegisterDate] = useState("");
    const [sportsRegisterDate, setSportsRegisterDate] = useState("");
    const [libraryRegisterDate, setLibraryRegisterDate] = useState("");

    // Section 1.62 State Variables
    const [expMaintenance, setExpMaintenance] = useState("");
    const [expTeachers, setExpTeachers] = useState("");
    const [expConstruction, setExpConstruction] = useState("");
    const [expOthers, setExpOthers] = useState("");

    // Section 2.1 - 2.5 Infrastructure State Variables
    const [buildingStatus, setBuildingStatus] = useState("");
    const [activeBuildingBlocks, setActiveBuildingBlocks] = useState("");
    const [buildingPucca, setBuildingPucca] = useState("");
    const [buildingPartiallyPucca, setBuildingPartiallyPucca] = useState("");
    const [buildingKuchcha, setBuildingKuchcha] = useState("");
    const [buildingTent, setBuildingTent] = useState("");

    const [storeySingle, setStoreySingle] = useState("");
    const [storeyDouble, setStoreyDouble] = useState("");
    const [storeyTriple, setStoreyTriple] = useState("");
    const [storeyMulti, setStoreyMulti] = useState("");

    const [buildingDilapidated, setBuildingDilapidated] = useState("");
    const [buildingUnderConstruction, setBuildingUnderConstruction] = useState("");

    const [classroomsPrePrimary, setClassroomsPrePrimary] = useState("");
    const [classroomsPrimary, setClassroomsPrimary] = useState("");
    const [classroomsUpperPrimary, setClassroomsUpperPrimary] = useState("");
    const [classroomsSecondary, setClassroomsSecondary] = useState("");
    const [classroomsHigherSecondary, setClassroomsHigherSecondary] = useState("");
    const [classroomsNotInUse, setClassroomsNotInUse] = useState("");
    const [totalInstructionalRooms, setTotalInstructionalRooms] = useState("");
    const [classroomsUnderConstruction, setClassroomsUnderConstruction] = useState("");
    const [classroomsDilapidated, setClassroomsDilapidated] = useState("");

    // 2.3(b) Grid
    const [condPuccaGood, setCondPuccaGood] = useState("");
    const [condPuccaMinor, setCondPuccaMinor] = useState("");
    const [condPuccaMajor, setCondPuccaMajor] = useState("");
    const [condPartiallyPuccaGood, setCondPartiallyPuccaGood] = useState("");
    const [condPartiallyPuccaMinor, setCondPartiallyPuccaMinor] = useState("");
    const [condPartiallyPuccaMajor, setCondPartiallyPuccaMajor] = useState("");
    const [condKuchchaGood, setCondKuchchaGood] = useState("");
    const [condKuchchaMinor, setCondKuchchaMinor] = useState("");
    const [condKuchchaMajor, setCondKuchchaMajor] = useState("");
    const [condTentGood, setCondTentGood] = useState("");
    const [condTentMinor, setCondTentMinor] = useState("");
    const [condTentMajor, setCondTentMajor] = useState("");

    const [boundaryWall, setBoundaryWall] = useState("");

    const [hasElectricity, setHasElectricity] = useState("");
    const [classroomsWithFans, setClassroomsWithFans] = useState("");
    const [classroomsWithACs, setClassroomsWithACs] = useState("");
    const [classroomsWithHeaters, setClassroomsWithHeaters] = useState("");
    const [hasSolarPanel, setHasSolarPanel] = useState("");

    // Section 2.6 - 2.10 Infrastructure State Variables
    const [hasPrincipalRoom, setHasPrincipalRoom] = useState("");
    const [hasLibraryRoom, setHasLibraryRoom] = useState("");
    const [hasVicePrincipalRoom, setHasVicePrincipalRoom] = useState("");
    const [hasGirlsCommonRoom, setHasGirlsCommonRoom] = useState("");
    const [hasStaffroom, setHasStaffroom] = useState("");
    const [hasCoCurricularRoom, setHasCoCurricularRoom] = useState("");
    const [labCount, setLabCount] = useState("");

    const [hasToilets, setHasToilets] = useState("");
    const [toiletBoysTotal, setToiletBoysTotal] = useState("");
    const [toiletBoysFunc, setToiletBoysFunc] = useState("");
    const [toiletBoysWater, setToiletBoysWater] = useState("");
    const [toiletGirlsTotal, setToiletGirlsTotal] = useState("");
    const [toiletGirlsFunc, setToiletGirlsFunc] = useState("");
    const [toiletGirlsWater, setToiletGirlsWater] = useState("");

    const [cwsnBoysTotal, setCwsnBoysTotal] = useState("");
    const [cwsnBoysFunc, setCwsnBoysFunc] = useState("");
    const [cwsnBoysWater, setCwsnBoysWater] = useState("");
    const [cwsnGirlsTotal, setCwsnGirlsTotal] = useState("");
    const [cwsnGirlsFunc, setCwsnGirlsFunc] = useState("");
    const [cwsnGirlsWater, setCwsnGirlsWater] = useState("");

    const [urinalsBoysTotal, setUrinalsBoysTotal] = useState("");
    const [urinalsGirlsTotal, setUrinalsGirlsTotal] = useState("");

    const [toiletsConstBoys, setToiletsConstBoys] = useState("");
    const [toiletsConstGirls, setToiletsConstGirls] = useState("");
    const [hasHandWashingNearToilets, setHasHandWashingNearToilets] = useState("");
    const [toiletLocation, setToiletLocation] = useState("");
    const [hasIncinerator, setHasIncinerator] = useState("");
    const [hasPadVendingMachine, setHasPadVendingMachine] = useState("");
    const [hasHandWashingBeforeMeal, setHasHandWashingBeforeMeal] = useState("");
    const [washPointsCount, setWashPointsCount] = useState("");

    const [waterHandPump, setWaterHandPump] = useState("");
    const [waterProtectedWell, setWaterProtectedWell] = useState("");
    const [waterUnprotectedWell, setWaterUnprotectedWell] = useState("");
    const [waterTapWater, setWaterTapWater] = useState("");
    const [waterPackagedWater, setWaterPackagedWater] = useState("");
    const [waterOthers, setWaterOthers] = useState("");
    const [hasWaterPurifier, setHasWaterPurifier] = useState("");
    const [hasWaterQualityTested, setHasWaterQualityTested] = useState("");

    const [hasRainWaterHarvesting, setHasRainWaterHarvesting] = useState("");

    // Section 2.11 - 2.19 Infrastructure State Variables
    const [hasLibrary, setHasLibrary] = useState("");
    const [libraryBooks, setLibraryBooks] = useState("");
    const [hasBookBank, setHasBookBank] = useState("");
    const [bookBankBooks, setBookBankBooks] = useState("");
    const [hasReadingCorner, setHasReadingCorner] = useState("");
    const [readingCornerBooks, setReadingCornerBooks] = useState("");
    const [hasFullTimeLibrarian, setHasFullTimeLibrarian] = useState("");
    const [subscribesNewspapers, setSubscribesNewspapers] = useState("");
    const [libraryBooksBorrowed, setLibraryBooksBorrowed] = useState("");

    const [landArea, setLandArea] = useState("");
    const [landAreaUnit, setLandAreaUnit] = useState("Square Meter");
    const [hasExpansionLand, setHasExpansionLand] = useState("");
    const [expansionType, setExpansionType] = useState("");
    const [additionalClassroomsNeeded, setAdditionalClassroomsNeeded] = useState("");

    const [hasPlayground, setHasPlayground] = useState("");
    const [playgroundArea, setPlaygroundArea] = useState("");
    const [playgroundUnit, setPlaygroundUnit] = useState("Square Meter");
    const [hasAlternatePlayground, setHasAlternatePlayground] = useState("");

    const [hasHealthCheckup, setHasHealthCheckup] = useState("");
    const [healthCheckupsCount, setHealthCheckupsCount] = useState("");
    const [healthParamsHeight, setHealthParamsHeight] = useState("");
    const [healthParamsWeight, setHealthParamsWeight] = useState("");
    const [healthParamsEyes, setHealthParamsEyes] = useState("");
    const [healthParamsDental, setHealthParamsDental] = useState("");
    const [healthParamsThroat, setHealthParamsThroat] = useState("");
    const [dewormingTablets, setDewormingTablets] = useState("");
    const [ironFolicTablets, setIronFolicTablets] = useState("");
    const [maintainsHealthRecords, setMaintainsHealthRecords] = useState("");
    const [hasThermalScanner, setHasThermalScanner] = useState("");
    const [hasFirstAid, setHasFirstAid] = useState("");
    const [hasEssentialMedicines, setHasEssentialMedicines] = useState("");

    const [hasRamp, setHasRamp] = useState("");
    const [hasHandRails, setHasHandRails] = useState("");
    const [hasSpecialEducator, setHasSpecialEducator] = useState("");

    const [hasKitchenGarden, setHasKitchenGarden] = useState("");
    const [hasKitchenShed, setHasKitchenShed] = useState("");

    const [dustbinsClassroom, setDustbinsClassroom] = useState("");
    const [dustbinsToilets, setDustbinsToilets] = useState("");
    const [dustbinsKitchen, setDustbinsKitchen] = useState("");

    const [hasStudentFurniture, setHasStudentFurniture] = useState("");
    const [furnitureStudentCount, setFurnitureStudentCount] = useState("");

    // Section 2.20 - 2.23 Infrastructure State Variables
    const [hasStaffQuarters, setHasStaffQuarters] = useState("");
    const [hasTinkeringLab, setHasTinkeringLab] = useState("");
    const [atlId, setAtlId] = useState("");
    const [hasIntegratedScienceLab, setHasIntegratedScienceLab] = useState("");

    const [hostelPrimaryAvailability, setHostelPrimaryAvailability] = useState("");
    const [hostelPrimaryBoys, setHostelPrimaryBoys] = useState("");
    const [hostelPrimaryGirls, setHostelPrimaryGirls] = useState("");

    const [hostelUpperPrimaryAvailability, setHostelUpperPrimaryAvailability] = useState("");
    const [hostelUpperPrimaryBoys, setHostelUpperPrimaryBoys] = useState("");
    const [hostelUpperPrimaryGirls, setHostelUpperPrimaryGirls] = useState("");

    const [hostelSecondaryAvailability, setHostelSecondaryAvailability] = useState("");
    const [hostelSecondaryBoys, setHostelSecondaryBoys] = useState("");
    const [hostelSecondaryGirls, setHostelSecondaryGirls] = useState("");
    const [hostelHigherSecondaryAvailability, setHostelHigherSecondaryAvailability] = useState("");
    const [hostelHigherSecondaryBoys, setHostelHigherSecondaryBoys] = useState("");
    const [hostelHigherSecondaryGirls, setHostelHigherSecondaryGirls] = useState("");

    const isResidentialCapacity =
        hostelPrimaryAvailability === "1-Yes" ||
        hostelUpperPrimaryAvailability === "1-Yes" ||
        hostelSecondaryAvailability === "1-Yes" ||
        hostelHigherSecondaryAvailability === "1-Yes";

    const [higherSecondaryLabs, setHigherSecondaryLabs] = useState([
        { name: "Physics", availability: "", separateRoom: "" },
        { name: "Chemistry", availability: "", separateRoom: "" },
        { name: "Biology", availability: "", separateRoom: "" },
        { name: "Mathematics", availability: "", separateRoom: "" },
        { name: "Language", availability: "", separateRoom: "" },
        { name: "Geography", availability: "", separateRoom: "" },
        { name: "Home Science", availability: "", separateRoom: "" },
        { name: "Psychology", availability: "", separateRoom: "" },
        { name: "Computer Science", availability: "", separateRoom: "" },
    ]);

    const [equipAudioVisual, setEquipAudioVisual] = useState("");
    const [equipBiometric, setEquipBiometric] = useState("");
    const [equipScienceKit, setEquipScienceKit] = useState("");
    const [equipMathKit, setEquipMathKit] = useState("");

    const [digitalEquipItems, setDigitalEquipItems] = useState<DigitalEquipRow[]>([
        { name: "(a) Desktop/PCs", total: "", pedagogical: "" },
        { name: "(b) Laptop/Notebook", total: "", pedagogical: "" },
        { name: "(c) Tablets", total: "", pedagogical: "" },
        { name: "(d) PCs with Integrated Teaching Learning Devices", total: "", pedagogical: "" },
        { name: "(e) Digital Boards with Content Management Systems and solutions (CMS)/ Learning Management System", total: "", pedagogical: "" },
        { name: "(f) Projector", total: "", pedagogical: "" },
        { name: "(g) Printer", total: "", pedagogical: "" },
        { name: "(h) Scanner", total: "", pedagogical: "" },
        { name: "(i) Server", total: "", pedagogical: "" },
        { name: "(j) Web Camera", total: "", pedagogical: "" },
        { name: "(k) Smart TV", total: "", pedagogical: "" },
        { name: "(l) Smart Class rooms used for teaching with Digital boards/ Smart boards/ Virtual classrooms/ Smart TV/IFP", total: "", pedagogical: "" },
        { name: "(m) Mobile phone used for teaching", total: "", pedagogical: "" },
        { name: "(n) Generator/Invertors/Power Backup/Big UPS (above 1KVA)", total: "", pedagogical: "" },
    ]);

    const [hasIctLab, setHasIctLab] = useState("");
    const [ictLabsCount, setIctLabsCount] = useState("");
    const [totalFunctionalIctDevices, setTotalFunctionalIctDevices] = useState("");
    const [hasSeparateIctLabRoom, setHasSeparateIctLabRoom] = useState("");

    const [hasSamagraIctLab, setHasSamagraIctLab] = useState("");
    const [samagraIctYear, setSamagraIctYear] = useState("");
    const [isSamagraIctFunctional, setIsSamagraIctFunctional] = useState("");
    const [samagraIctModel, setSamagraIctModel] = useState("");
    const [samagraIctInstructorType, setSamagraIctInstructorType] = useState("");

    const [hasInternet, setHasInternet] = useState("");
    const [internetType, setInternetType] = useState("");
    const [internetPedagogical, setInternetPedagogical] = useState("");

    const [digitalTeachingTools, setDigitalTeachingTools] = useState<DigitalFacilityRow[]>([
        { name: "(a) Whether ICT based tools are being used for teaching?", availability: "" },
        { name: "(b) Access to e-Contents/Digital Contents/resources at school", availability: "" },
        { name: "(c) Assistive tech-based solutions for CWSN", availability: "" },
        { name: "(d) Access to DTH/TV channels", availability: "" },
    ]);

    const [hasDigitalLibrary, setHasDigitalLibrary] = useState("");
    const [digitalLibraryBooks, setDigitalLibraryBooks] = useState("");

    const handleLabChange = (index: number, field: string, value: string) => {
        const newLabs = [...higherSecondaryLabs];
        newLabs[index] = { ...newLabs[index], [field]: value };
        setHigherSecondaryLabs(newLabs);
    };

    // Step 8: Vocational Education State Variables
    const [vocationalGuestLecturers, setVocationalGuestLecturers] = useState("");
    const [vocationalIndustryVisits, setVocationalIndustryVisits] = useState("");
    const [vocationalIndustryLinkages, setVocationalIndustryLinkages] = useState("");

    const [placEnrolled10, setPlacEnrolled10] = useState("");
    const [placPassed10, setPlacPassed10] = useState("");
    const [placSelfEmp10, setPlacSelfEmp10] = useState("");
    const [placPlaced10, setPlacPlaced10] = useState("");

    const [placEnrolled12, setPlacEnrolled12] = useState("");
    const [placPassed12, setPlacPassed12] = useState("");
    const [placSelfEmp12, setPlacSelfEmp12] = useState("");
    const [placPlaced12, setPlacPlaced12] = useState("");

    const [vocationalLabs, setVocationalLabs] = useState<VocationalLabRow[]>([
        { sector: "Sector-1", condition: "", separateRoom: "" },
        { sector: "Sector-2", condition: "", separateRoom: "" },
        { sector: "Sector-3", condition: "", separateRoom: "" },
        { sector: "Sector-4", condition: "", separateRoom: "" },
    ]);

    // Location State Variables (Step 4)
    const [address, setAddress] = useState("");
    const [pinCode, setPinCode] = useState("");
    const [revenueBlock, setRevenueBlock] = useState("");
    const [villageName, setVillageName] = useState("");
    const [gramPanchayat, setGramPanchayat] = useState("");
    const [urbanLocalBody, setUrbanLocalBody] = useState("");
    const [wardName, setWardName] = useState("");
    const [crcName, setCrcName] = useState("");
    const [assemblyConstituency, setAssemblyConstituency] = useState("");
    const [parliamentaryConstituency, setParliamentaryConstituency] = useState("");
    const [district, setDistrict] = useState("");
    const [taluka, setTaluka] = useState("");

    // Section 10: Transportation Details
    const [transFitnessCert, setTransFitnessCert] = useState("");
    const [transVehicleAge, setTransVehicleAge] = useState("");
    const [transPermit, setTransPermit] = useState("");
    const [transSpeedGovernor, setTransSpeedGovernor] = useState("");
    const [transVehicleExterior, setTransVehicleExterior] = useState("");
    const [transSchoolBusProminent, setTransSchoolBusProminent] = useState("");
    const [transHiredBusDuty, setTransHiredBusDuty] = useState("");
    const [transSchoolNameWritten, setTransSchoolNameWritten] = useState("");
    const [transDriverExperience, setTransDriverExperience] = useState("");
    const [transDriverNoTrafficOffences, setTransDriverNoTrafficOffences] = useState("");
    const [transAutoSafety, setTransAutoSafety] = useState("");
    const [transAutoParentInstruction, setTransAutoParentInstruction] = useState("");
    const [transAutoRegistered, setTransAutoRegistered] = useState("");

    const progress = Math.round(((currentStep + 1) / steps.length) * 100);

    // ─── API state ───────────────────────────────────────────────────────────
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const showSaveResult = (err?: string) => {
        setSaveError(err ?? null);
        setSaveSuccess(!err);
        setTimeout(() => setSaveSuccess(false), 2500);
    };

    // ─── Per-step save functions (called by Save button) ─────────────────────

    const saveBasicDetails = () => apiPut(`/profile/basic-details`, {
        school_name: schoolName,
        est_year: estYear,
        board_affiliation: boardAffiliation,
        std_code: stdCode,
        landline,
        mobile,
        email,
        website,
        sub_management: subManagement,
        is_pm_shri: isPmShri,
        school_type: schoolType,
        lowest_class: lowestClass,
        highest_class: highestClass,
        location_type: locationType,
        management_group: managementGroup,
        management_code: managementCode,
        classification,
        application_type: applicationType,
        school_category: schoolCategory,
        curriculum_primary: curriculumPrimary,
        curriculum_upper_primary: curriculumUpperPrimary,
        is_minority: isMinority,
        minority_community: minorityCommunity,
        is_rte: isRTE,
        is_vocational: isVocational,
        funding_source: fundingSource,
        sanction_order_number: sanctionOrderNumber,
        is_pre_vocational: isPreVocational,
        is_skill_center: isSkillCenter,
        is_residential: isResidential,
        residential_type: residentialType,
        is_shift: isShift,
        is_mother_tongue: isMotherTongue,
        dist_primary: distPrimary,
        dist_upper_primary: distUpperPrimary,
        dist_secondary: distSecondary,
        dist_higher_secondary: distHigherSecondary,
        is_all_weather_road: isAllWeatherRoad,
        instructional_days: instructionalDays,
        is_cce: isCCE,
        is_records_maintained: isRecordsMaintained,
        is_records_shared: isRecordsShared,
        has_anganwadi: hasAnganwadi,
        anganwadi_centers_count: anganwadiCentersCount,
        anganwadi_rows: anganwadiRows,
        has_balavatika: hasBalavatika,
        has_oosc: hasOoSC,
        has_oosc_st: hasOoSCST,
        remedial_students: remedialStudents,
        learning_enhancement_students: learningEnhancementStudents,
        academic_inspections: academicInspections,
        crc_visits: crcVisits,
        brc_visits: brcVisits,
        district_visits: districtVisits,
        regional_visits: regionalVisits,
        hq_visits: hqVisits,
        has_smc: hasSMC,
        has_sdmc: hasSDMC,
        smc_meetings: smcMeetings,
        has_smc_plan: hasSMCPlan,
        smc_plan_year: smcPlanYear,
        has_sbc: hasSBC,
        has_ac: hasAC,
        has_pta: hasPTA,
        pta_meetings: ptaMeetings,
        has_pfms: hasPFMS,
        pfms_id: pfmsId,
        has_multi_class: hasMultiClass,
        multi_class_rows: multiClassRows,
        is_school_complex: isSchoolComplex,
        is_hub_school: isHubSchool,
        complex_pre_primary: complexPrePrimary,
        complex_primary: complexPrimary,
        complex_upper_primary: complexUpperPrimary,
        complex_secondary: complexSecondary,
        complex_higher_secondary: complexHigherSecondary,
        complex_total: complexTotal,
        has_ebsb: hasEBSB,
        has_fit_india: hasFitIndia,
        has_holistic_report_card: hasHolisticReportCard,
        pm_poshan_total_days: pmPoshanTotalDays,
        pm_poshan_days_per_week: pmPoshanDaysPerWeek,
        pm_poshan_days_per_month: pmPoshanDaysPerMonth,
        pm_poshan_balvatika: pmPoshanBalvatika,
        has_agreed_to_first_year_activities: hasAgreedToFirstYearActivities,
        has_disaster_plan: hasDisasterPlan,
        has_structural_audit: hasStructuralAudit,
        has_non_structural_audit: hasNonStructuralAudit,
        has_cctv: hasCCTV,
        has_fire_extinguishers: hasFireExtinguishers,
        has_nodal_teacher: hasNodalTeacher,
        has_safety_training: hasSafetyTraining,
        safety_training_date: safetyTrainingDate,
        disaster_management_taught: disasterManagementTaught,
        has_self_defence_grant: hasSelfDefenceGrant,
        self_defence_upper_primary: selfDefenceUpperPrimary,
        self_defence_secondary: selfDefenceSecondary,
        self_defence_higher_secondary: selfDefenceHigherSecondary,
        has_safety_display_board: hasSafetyDisplayBoard,
        has_first_level_counselor: hasFirstLevelCounselor,
        safety_audit_frequency: safetyAuditFrequency,
        has_teacher_photos: hasTeacherPhotos,
        has_vidya_pravesh: hasVidyaPravesh,
        student_attendance_capture: studentAttendanceCapture,
        teacher_attendance_capture: teacherAttendanceCapture,
        has_youth_club: hasYouthClub,
        has_eco_club: hasEcoClub,
        has_teacher_id: hasTeacherID,
        sssa_certification: sssaCertification,
        has_ict_register: hasIctRegister,
        has_sports_register: hasSportsRegister,
        has_library_register: hasLibraryRegister,
        ict_register_date: ictRegisterDate,
        sports_register_date: sportsRegisterDate,
        library_register_date: libraryRegisterDate,
        sec_156: sec156,
        sec_157: sec157,
    });

    const saveReceiptsExpenditure = () => apiPut(`/profile/receipts-expenditure`, {
        exp_maintenance: expMaintenance,
        exp_teachers: expTeachers,
        exp_construction: expConstruction,
        exp_others: expOthers,
        grants: grants.map(g => ({
            grant_name: g.grantName,
            receipt: g.receipt,
            expenditure: g.expenditure,
        })),
        assistance: assistance.map(a => ({
            source: a.source,
            is_received: a.isReceived,
            name: a.name,
            amount: a.amount,
        })),
    });

    const saveLegalDetails = () => apiPut(`/profile/legal-details`, {
        is_vocational: isVocational,
        funding_source: fundingSource,
        sanction_order_number: sanctionOrderNumber,
        vocational_rows: vocationalRows.map(r => ({
            grade: r.grade,
            sector: r.sector,
            job_role: r.jobRole,
            year_starting: r.yearStarting,
        })),
    });

    const saveLocation = () => apiPut(`/profile/location`, {
        address,
        pin_code: pinCode,
        revenue_block: revenueBlock,
        village_name: villageName,
        gram_panchayat: gramPanchayat,
        urban_local_body: urbanLocalBody,
        ward_name: wardName,
        crc_name: crcName,
        assembly_constituency: assemblyConstituency,
        parliamentary_constituency: parliamentaryConstituency,
        district,
        taluka,
    });

    const saveInfrastructure = () => apiPut(`/profile/infrastructure`, {
        building_status: buildingStatus,
        active_building_blocks: activeBuildingBlocks,
        building_pucca: buildingPucca,
        building_partially_pucca: buildingPartiallyPucca,
        building_kuchcha: buildingKuchcha,
        building_tent: buildingTent,
        storey_single: storeySingle,
        storey_double: storeyDouble,
        storey_triple: storeyTriple,
        storey_multi: storeyMulti,
        building_dilapidated: buildingDilapidated,
        building_under_construction: buildingUnderConstruction,
        classrooms_pre_primary: classroomsPrePrimary,
        classrooms_primary: classroomsPrimary,
        classrooms_upper_primary: classroomsUpperPrimary,
        classrooms_secondary: classroomsSecondary,
        classrooms_higher_secondary: classroomsHigherSecondary,
        classrooms_not_in_use: classroomsNotInUse,
        total_instructional_rooms: totalInstructionalRooms,
        classrooms_under_construction: classroomsUnderConstruction,
        classrooms_dilapidated: classroomsDilapidated,
        cond_pucca_good: condPuccaGood,
        cond_pucca_minor: condPuccaMinor,
        cond_pucca_major: condPuccaMajor,
        cond_partially_pucca_good: condPartiallyPuccaGood,
        cond_partially_pucca_minor: condPartiallyPuccaMinor,
        cond_partially_pucca_major: condPartiallyPuccaMajor,
        cond_kuchcha_good: condKuchchaGood,
        cond_kuchcha_minor: condKuchchaMinor,
        cond_kuchcha_major: condKuchchaMajor,
        cond_tent_good: condTentGood,
        cond_tent_minor: condTentMinor,
        cond_tent_major: condTentMajor,
        boundary_wall: boundaryWall,
        has_electricity: hasElectricity,
        classrooms_with_fans: classroomsWithFans,
        classrooms_with_acs: classroomsWithACs,
        classrooms_with_heaters: classroomsWithHeaters,
        has_solar_panel: hasSolarPanel,
        has_principal_room: hasPrincipalRoom,
        has_library_room: hasLibraryRoom,
        has_vice_principal_room: hasVicePrincipalRoom,
        has_girls_common_room: hasGirlsCommonRoom,
        has_staffroom: hasStaffroom,
        has_co_curricular_room: hasCoCurricularRoom,
        lab_count: labCount,
        has_toilets: hasToilets,
        toilet_boys_total: toiletBoysTotal,
        toilet_boys_func: toiletBoysFunc,
        toilet_boys_water: toiletBoysWater,
        toilet_girls_total: toiletGirlsTotal,
        toilet_girls_func: toiletGirlsFunc,
        toilet_girls_water: toiletGirlsWater,
        cwsn_boys_total: cwsnBoysTotal,
        cwsn_boys_func: cwsnBoysFunc,
        cwsn_boys_water: cwsnBoysWater,
        cwsn_girls_total: cwsnGirlsTotal,
        cwsn_girls_func: cwsnGirlsFunc,
        cwsn_girls_water: cwsnGirlsWater,
        urinals_boys_total: urinalsBoysTotal,
        urinals_girls_total: urinalsGirlsTotal,
        toilets_const_boys: toiletsConstBoys,
        toilets_const_girls: toiletsConstGirls,
        has_hand_washing_near_toilets: hasHandWashingNearToilets,
        toilet_location: toiletLocation,
        has_incinerator: hasIncinerator,
        has_pad_vending_machine: hasPadVendingMachine,
        has_hand_washing_before_meal: hasHandWashingBeforeMeal,
        wash_points_count: washPointsCount,
        water_hand_pump: waterHandPump,
        water_protected_well: waterProtectedWell,
        water_unprotected_well: waterUnprotectedWell,
        water_tap_water: waterTapWater,
        water_packaged_water: waterPackagedWater,
        water_others: waterOthers,
        has_water_purifier: hasWaterPurifier,
        has_water_quality_tested: hasWaterQualityTested,
        has_rain_water_harvesting: hasRainWaterHarvesting,
        has_library: hasLibrary,
        library_books: libraryBooks,
        has_book_bank: hasBookBank,
        book_bank_books: bookBankBooks,
        has_reading_corner: hasReadingCorner,
        reading_corner_books: readingCornerBooks,
        has_full_time_librarian: hasFullTimeLibrarian,
        subscribes_newspapers: subscribesNewspapers,
        library_books_borrowed: libraryBooksBorrowed,
        land_area: landArea,
        land_area_unit: landAreaUnit,
        has_expansion_land: hasExpansionLand,
        expansion_type: expansionType,
        additional_classrooms_needed: additionalClassroomsNeeded,
        has_playground: hasPlayground,
        playground_area: playgroundArea,
        playground_unit: playgroundUnit,
        has_alternate_playground: hasAlternatePlayground,
        has_health_checkup: hasHealthCheckup,
        health_checkups_count: healthCheckupsCount,
        health_params_height: healthParamsHeight,
        health_params_weight: healthParamsWeight,
        health_params_eyes: healthParamsEyes,
        health_params_dental: healthParamsDental,
        health_params_throat: healthParamsThroat,
        deworming_tablets: dewormingTablets,
        iron_folic_tablets: ironFolicTablets,
        maintains_health_records: maintainsHealthRecords,
        has_thermal_scanner: hasThermalScanner,
        has_first_aid: hasFirstAid,
        has_essential_medicines: hasEssentialMedicines,
        has_ramp: hasRamp,
        has_hand_rails: hasHandRails,
        has_special_educator: hasSpecialEducator,
        has_kitchen_garden: hasKitchenGarden,
        has_kitchen_shed: hasKitchenShed,
        dustbins_classroom: dustbinsClassroom,
        dustbins_toilets: dustbinsToilets,
        dustbins_kitchen: dustbinsKitchen,
        has_student_furniture: hasStudentFurniture,
        furniture_student_count: furnitureStudentCount,
        has_staff_quarters: hasStaffQuarters,
        has_tinkering_lab: hasTinkeringLab,
        atl_id: atlId,
        has_integrated_science_lab: hasIntegratedScienceLab,
        hostel_primary_availability: hostelPrimaryAvailability,
        hostel_primary_boys: hostelPrimaryBoys,
        hostel_primary_girls: hostelPrimaryGirls,
        hostel_upper_primary_availability: hostelUpperPrimaryAvailability,
        hostel_upper_primary_boys: hostelUpperPrimaryBoys,
        hostel_upper_primary_girls: hostelUpperPrimaryGirls,
        hostel_secondary_availability: hostelSecondaryAvailability,
        hostel_secondary_boys: hostelSecondaryBoys,
        hostel_secondary_girls: hostelSecondaryGirls,
        hostel_higher_secondary_availability: hostelHigherSecondaryAvailability,
        hostel_higher_secondary_boys: hostelHigherSecondaryBoys,
        hostel_higher_secondary_girls: hostelHigherSecondaryGirls,
        equip_audio_visual: equipAudioVisual,
        equip_biometric: equipBiometric,
        equip_science_kit: equipScienceKit,
        equip_math_kit: equipMathKit,
        has_ict_lab: hasIctLab,
        ict_labs_count: ictLabsCount,
        total_functional_ict_devices: totalFunctionalIctDevices,
        has_separate_ict_lab_room: hasSeparateIctLabRoom,
        has_samagra_ict_lab: hasSamagraIctLab,
        samagra_ict_year: samagraIctYear,
        is_samagra_ict_functional: isSamagraIctFunctional,
        samagra_ict_model: samagraIctModel,
        samagra_ict_instructor_type: samagraIctInstructorType,
        has_internet: hasInternet,
        internet_type: internetType,
        internet_pedagogical: internetPedagogical,
        has_digital_library: hasDigitalLibrary,
        digital_library_books: digitalLibraryBooks,
        higher_secondary_labs: higherSecondaryLabs.map(l => ({
            name: l.name,
            availability: l.availability,
            separate_room: l.separateRoom,
        })),
        digital_equip_items: digitalEquipItems.map(d => ({
            name: d.name,
            total: d.total,
            pedagogical: d.pedagogical,
        })),
        digital_teaching_tools: digitalTeachingTools.map(d => ({
            name: d.name,
            availability: d.availability,
        })),
    });

    const saveStaff = async () => {
        // Save staff summary counts
        await apiPut(`/profile/staff/summary`, {
            counts: {
                regular: staffCounts.regular,
                non_regular: staffCounts.nonRegular,
                non_teaching: staffCounts.nonTeaching,
                vocational: staffCounts.vocational,
            },
            required: {
                pre_primary: staffRequired.prePrimary,
                primary: staffRequired.primary,
                upper_primary: staffRequired.upperPrimary,
                secondary: staffRequired.secondary,
                higher_secondary: staffRequired.higherSecondary,
            },
        });
        // Sync teachers: add each one (server clears + repopulates on save)
        for (const t of teachers) {
            if (t.id && !t.id.match(/^[a-z0-9]{9}$/)) {
                // Backend-assigned id — update
                await apiPut(`/profile/staff/teachers/${t.id}`, mapTeacher(t));
            } else {
                await apiPost(`/profile/staff/teachers`, mapTeacher(t));
            }
        }
        for (const s of nonTeachingStaff) {
            if (s.id && !s.id.match(/^[a-z0-9]{9}$/)) {
                await apiPut(`/profile/staff/non-teaching/${s.id}`, mapNonTeaching(s));
            } else {
                await apiPost(`/profile/staff/non-teaching`, mapNonTeaching(s));
            }
        }
        for (const v of vocationalStaff) {
            if (v.id && !v.id.match(/^[a-z0-9]{9}$/)) {
                await apiPut(`/profile/staff/vocational/${v.id}`, mapVocational(v));
            } else {
                await apiPost(`/profile/staff/vocational`, mapVocational(v));
            }
        }
    };

    const saveSafety = () => apiPut(`/profile/safety`, {
        has_disaster_plan: hasDisasterPlan,
        has_structural_audit: hasStructuralAudit,
        has_non_structural_audit: hasNonStructuralAudit,
        has_cctv: hasCCTV,
        has_fire_extinguishers: hasFireExtinguishers,
        has_nodal_teacher: hasNodalTeacher,
        has_safety_training: hasSafetyTraining,
        safety_training_date: safetyTrainingDate,
        disaster_management_taught: disasterManagementTaught,
        has_self_defence_grant: hasSelfDefenceGrant,
        self_defence_upper_primary: selfDefenceUpperPrimary,
        self_defence_secondary: selfDefenceSecondary,
        self_defence_higher_secondary: selfDefenceHigherSecondary,
        has_safety_display_board: hasSafetyDisplayBoard,
        has_first_level_counselor: hasFirstLevelCounselor,
        safety_audit_frequency: safetyAuditFrequency,
    });

    const saveStudentCapacity = async () => {
        await apiPut(`/profile/student-capacity/sections`, sectionConfigs.map(c => ({
            class_name: c.className,
            number_of_sections: c.numberOfSections,
            section_names: c.sectionNames,
        })));
        for (const s of students) {
            if (s.id && !s.id.match(/^[a-z0-9]{9}$/)) {
                await apiPut(`/profile/students/${s.id}`, mapStudent(s));
            } else {
                await apiPost(`/profile/students`, mapStudent(s));
            }
        }
    };

    const saveVocationalEducation = () => apiPut(`/profile/vocational-education`, {
        vocational_guest_lecturers: vocationalGuestLecturers,
        vocational_industry_visits: vocationalIndustryVisits,
        vocational_industry_linkages: vocationalIndustryLinkages,
        plac_enrolled_10: placEnrolled10,
        plac_passed_10: placPassed10,
        plac_self_emp_10: placSelfEmp10,
        plac_placed_10: placPlaced10,
        plac_enrolled_12: placEnrolled12,
        plac_passed_12: placPassed12,
        plac_self_emp_12: placSelfEmp12,
        plac_placed_12: placPlaced12,
        vocational_labs: vocationalLabs.map(l => ({
            sector: l.sector,
            condition: l.condition,
            separate_room: l.separateRoom,
        })),
    });

    // ─── Step → save function map ─────────────────────────────────────────────
    const stepSaveFns: (() => Promise<void>)[] = [
        saveBasicDetails,          // 0 Basic Details
        saveReceiptsExpenditure,   // 1 Receipts and Expenditure
        saveLegalDetails,          // 2 Legal Details
        saveLocation,              // 3 Location
        saveInfrastructure,        // 4 Infrastructure
        saveStaff,                 // 5 Staff
        saveSafety,                // 6 Safety
        saveStudentCapacity,       // 7 Student Capacity
        saveVocationalEducation,   // 8 Vocational Education
    ];

    const handleSave = async () => {
        setIsSaving(true);
        setSaveError(null);
        try {
            await stepSaveFns[currentStep]();
            showSaveResult();
        } catch (e: unknown) {
            showSaveResult(e instanceof Error ? e.message : "Save failed");
        } finally {
            setIsSaving(false);
        }
    };

    // Save current step then advance
    const handleNext = async () => {
        if (!validateStep(currentStep)) return;
        setIsSaving(true);
        setSaveError(null);
        try {
            await stepSaveFns[currentStep]();
        } catch (e: unknown) {
            setSaveError(e instanceof Error ? e.message : "Save failed");
            setIsSaving(false);
            return; // Don't advance if save failed
        }
        setIsSaving(false);
        setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
        window.scrollTo(0, 0);
    };

    // Final submit — save all steps then POST /profile/submit
    const handleSubmit = async () => {
        setIsSaving(true);
        setSaveError(null);
        try {
            // Save current (last) step first
            await stepSaveFns[currentStep]();
            // Then call full submit endpoint
            await apiPost(`/profile/submit`, {});
            showSaveResult();
            alert("Profile submitted successfully! ✅");
        } catch (e: unknown) {
            setSaveError(e instanceof Error ? e.message : "Submit failed");
        } finally {
            setIsSaving(false);
        }
    };

    // ─── Payload mappers (camelCase UI → snake_case API) ─────────────────────

    const mapTeacher = (t: TeacherDetail) => ({
        name: t.name, gender: t.gender, dob: t.dob,
        social_category: t.socialCategory, is_cwsn: t.isCWSN, disability: t.disability,
        academic_level: t.academicLevel, academic_degree: t.academicDegree,
        professional_qual: t.professionalQual, national_code: t.nationalCode,
        teacher_code_state: t.teacherCodeState, mobile: t.mobile, email: t.email,
        aadhaar_number: t.aadhaarNumber, aadhaar_name: t.aadhaarName, crr_number: t.crrNumber,
        subject_level_math: t.subjectLevelMath, subject_level_science: t.subjectLevelScience,
        subject_level_english: t.subjectLevelEnglish,
        subject_level_social_science: t.subjectLevelSocialScience,
        subject_level_language: t.subjectLevelLanguage,
        nature_of_appointment: t.natureOfAppointment, teacher_type: t.teacherType,
        appointed_level: t.appointedLevel, classes_taught: t.classesTaught,
        date_joining_service: t.dateJoiningService,
        date_joining_present_school: t.dateJoiningPresentSchool,
        appointed_for_subject: t.appointedForSubject,
        main_subject_1: t.mainSubject1, main_subject_2: t.mainSubject2,
        is_deputation: t.isDeputation, is_guest_contractual: t.isGuestContractual,
        training_needed: t.trainingNeeded, training_received: t.trainingReceived,
        languages: t.languages,
        hs_mastery_physics: t.hsMasteryPhysics, hs_mastery_chemistry: t.hsMasteryChemistry,
        hs_mastery_biology: t.hsMasteryBiology, hs_mastery_math: t.hsMasteryMath,
        trained_cwsn: t.trainedCWSN, trained_computer: t.trainedComputer,
        is_nishtha_trained: t.isNishthaTrained, non_teaching_days: t.nonTeachingDays,
        trained_safety: t.trainedSafety, trained_cyber_safety: t.trainedCyberSafety,
        trained_cwsn_identification: t.trainedCWSNIdentification,
        is_tet_qualified: t.isTETQualified, tet_year: t.tetYear,
        is_capable_digital: t.isCapableDigital,
    });

    const mapNonTeaching = (s: NonTeachingStaff) => ({
        name: s.name, gender: s.gender, dob: s.dob,
        state_code: s.stateCode, social_category: s.socialCategory,
        academic_level: s.academicLevel, degree: s.degree,
        mobile: s.mobile, email: s.email,
        aadhaar_number: s.aadhaarNumber, aadhaar_name: s.aadhaarName,
        disability: s.disability, nature_of_appointment: s.natureOfAppointment,
        date_joining_service: s.dateJoiningService,
        date_joining_school: s.dateJoiningSchool, current_post: s.currentPost,
    });

    const mapVocational = (v: VocationalStaff) => ({
        name: v.name, gender: v.gender, dob: v.dob,
        vtp_code: v.vtpCode, social_category: v.socialCategory,
        academic_level: v.academicLevel, degree: v.degree,
        professional_qual: v.professionalQual,
        mobile: v.mobile, email: v.email,
        aadhaar_number: v.aadhaarNumber, aadhaar_name: v.aadhaarName,
        disability: v.disability, nature_of_appointment: v.natureOfAppointment,
        date_joining_service: v.dateJoiningService,
        date_joining_school: v.dateJoiningSchool,
        type_of_teacher: v.typeOfTeacher, classes_taught: v.classesTaught,
        sector: v.sector, job_role: v.jobRole, experience: v.experience,
        received_induction: v.receivedInduction,
    });

    const mapStudent = (s: StudentProfile) => ({
        name: s.name, gender: s.gender, dob: s.dob,
        mother_name: s.motherName, father_name: s.fatherName, guardian_name: s.guardianName,
        aadhaar_number: s.aadhaarNumber, aadhaar_name: s.aadhaarName,
        address: s.address, pincode: s.pincode, mobile: s.mobile,
        alternate_mobile: s.alternateMobile, email: s.email,
        mother_tongue: s.motherTongue, social_category: s.socialCategory,
        minority_group: s.minorityGroup, is_bpl: s.isBPL, is_aay: s.isAAY,
        is_ews: s.isEWS, is_cwsn: s.isCWSN, impairment_type: s.impairmentType,
        has_disability_certificate: s.hasDisabilityCertificate,
        is_indian_national: s.isIndianNational, out_of_school_child: s.outOfSchoolChild,
        mainstreaming_year: s.mainstreamingYear, blood_group: s.bloodGroup,
        academic_year: s.academicYear, school_udise_code: s.schoolUdiseCode,
        student_grade: s.studentGrade, student_national_code: s.studentNationalCode,
        student_section: s.studentSection, roll_number: s.rollNumber,
        admission_number: s.admissionNumber, admission_date: s.admissionDate,
        instruction_medium: s.instructionMedium, language_group: s.languageGroup,
        academic_stream: s.academicStream, prev_year_status: s.prevYearStatus,
        prev_year_grade: s.prevYearGrade, is_admitted_rte: s.isAdmittedRTE,
        rte_amount_claimed: s.rteAmountClaimed, prev_class_result: s.prevClassResult,
        prev_class_marks: s.prevClassMarks, prev_year_attendance: s.prevYearAttendance,
        has_facilities: s.hasFacilities, facilities_received: s.facilitiesReceived,
        has_cwsn_facilities: s.hasCWSNFacilities, cwsn_facilities_received: s.cwsnFacilitiesReceived,
        screened_sld: s.screenedSLD, sld_type: s.sldType,
        screened_asd: s.screenedASD, screened_adhd: s.screenedADHD,
        is_gifted: s.isGifted, appeared_competitions: s.appearedCompetitions,
        participates_ncc: s.participatesNCC, digital_capable: s.digitalCapable,
        height: s.height, weight: s.weight,
        distance_to_school: s.distanceToSchool, guardian_education: s.guardianEducation,
        undertook_vocational: s.undertookVocational, vocational_trade: s.vocationalTrade,
        vocational_job_role: s.vocationalJobRole,
        vocational_prev_class_exam: s.vocationalPrevClassExam,
        vocational_prev_class_marks: s.vocationalPrevClassMarks,
        current_year_result: s.currentYearResult, current_year_marks: s.currentYearMarks,
        current_year_attendance: s.currentYearAttendance,
    });

    useEffect(() => {
        if (applicationType === "New Recognition") {
            setAcademicInspections("0");
            setCrcVisits("0");
            setBrcVisits("0");
            setDistrictVisits("0");
            setRegionalVisits("0");
            setHqVisits("0");
            setHasEBSB("2-No");
            setHasFitIndia("2-No");
            setHasHolisticReportCard("2-No");
            setHasTeacherID("1-Yes"); // Mandatory operational standard declaration
        }
    }, [applicationType]);

    // Auto-generate section configs when class range or pre-primary changes
    useEffect(() => {
        const low = parseInt(lowestClass);
        const high = parseInt(highestClass);
        if (isNaN(low) || isNaN(high) || low > high || low < 1 || high > 12) {
            setSectionConfigs([]);
            return;
        }
        const configs: SectionConfig[] = [];
        // Add pre-primary rows if applicable
        if (hasPrePrimary === "1-Yes") {
            ["Nursery", "LKG", "UKG"].forEach(name => {
                configs.push({ className: name, numberOfSections: 1, sectionNames: ["A"] });
            });
        }
        // Add class rows
        for (let i = low; i <= high; i++) {
            configs.push({ className: `Class ${i}`, numberOfSections: 1, sectionNames: ["A"] });
        }
        setSectionConfigs(configs);
        setIsSectionConfigSaved(false);
    }, [lowestClass, highestClass, hasPrePrimary]);

    // Persist profile data to localStorage for registration page auto-population
    useEffect(() => {
        const totalClassrooms = [classroomsPrePrimary, classroomsPrimary, classroomsUpperPrimary, classroomsSecondary, classroomsHigherSecondary]
            .reduce((sum, v) => sum + (parseInt(v) || 0), 0);

        const profileData = {
            // Identity
            schoolName,
            udiseNumber,
            estYear,
            boardAffiliation,
            schoolCategory,
            schoolType,
            classification,
            applicationType,
            // Contact
            stdCode,
            landline,
            mobile,
            email,
            website,
            // Management
            managementGroup,
            managementCode,
            subManagement,
            isPmShri,
            // Class Range
            lowestClass,
            highestClass,
            hasPrePrimary,
            // Location
            locationType,
            address,
            pinCode,
            district,
            taluka,
            revenueBlock,
            villageName,
            gramPanchayat,
            urbanLocalBody,
            wardName,
            crcName,
            assemblyConstituency,
            parliamentaryConstituency,
            // Infrastructure summary
            landArea,
            landAreaUnit,
            hasPlayground,
            buildingStatus,
            totalClassrooms: totalClassrooms.toString(),
            hasElectricity,
            hasLibrary,
            hasRamp,
            // Staff summary
            totalTeachingStaff: teachers.length.toString(),
            totalNonTeachingStaff: nonTeachingStaff.length.toString(),
            totalVocationalStaff: vocationalStaff.length.toString(),
            // Student summary
            totalStudents: students.length.toString(),
            // Profile completeness flag
            isProfileComplete: !!(schoolName && email && mobile && address && district),
            // Transportation Details
            transFitnessCert, transVehicleAge, transPermit, transSpeedGovernor, transVehicleExterior,
            transSchoolBusProminent, transHiredBusDuty, transSchoolNameWritten, transDriverExperience,
            transDriverNoTrafficOffences, transAutoSafety, transAutoParentInstruction, transAutoRegistered
        };
        localStorage.setItem("profileData", JSON.stringify(profileData));
    }, [
        schoolName, udiseNumber, estYear, boardAffiliation, schoolCategory, schoolType, classification, applicationType,
        stdCode, landline, mobile, email, website,
        managementGroup, managementCode, subManagement, isPmShri,
        lowestClass, highestClass, hasPrePrimary,
        locationType, address, pinCode, district, taluka,
        revenueBlock, villageName, gramPanchayat, urbanLocalBody, wardName,
        crcName, assemblyConstituency, parliamentaryConstituency,
        landArea, landAreaUnit, hasPlayground, buildingStatus,
        classroomsPrePrimary, classroomsPrimary, classroomsUpperPrimary, classroomsSecondary, classroomsHigherSecondary,
        hasElectricity, hasLibrary, hasRamp,
        teachers.length, nonTeachingStaff.length, vocationalStaff.length, students.length,
        transFitnessCert, transVehicleAge, transPermit, transSpeedGovernor, transVehicleExterior,
        transSchoolBusProminent, transHiredBusDuty, transSchoolNameWritten, transDriverExperience,
        transDriverNoTrafficOffences, transAutoSafety, transAutoParentInstruction, transAutoRegistered
    ]);

    const handleSectionCountChange = (index: number, count: number) => {
        const updated = [...sectionConfigs];
        const clamped = Math.max(1, Math.min(count, 10));
        const names = Array.from({ length: clamped }, (_, i) => String.fromCharCode(65 + i));
        updated[index] = { ...updated[index], numberOfSections: clamped, sectionNames: names };
        setSectionConfigs(updated);
    };

    const validateStep = (step: number) => {
        const errors: string[] = [];

        if (step === 0) {
            if (!schoolName) errors.push("School Name");
            if (!udiseNumber) errors.push("UDISE Number");
            if (!estYear) errors.push("Year of Establishment");
            if (!boardAffiliation) errors.push("Board Affiliation");
            if (!managementGroup) errors.push("Management Group");
            if (!schoolCategory) errors.push("School Category");
            if (!lowestClass) errors.push("Lowest Class");
            if (!highestClass) errors.push("Highest Class");
            if (!mobile) errors.push("Mobile Number (Contact)");
            if (!email) errors.push("Email (Contact)");
        }

        if (step === 9) {
            if (!transFitnessCert) errors.push("1. Fitness Certificate");
            if (!transVehicleAge) errors.push("2. Vehicle Age");
            if (!transPermit) errors.push("3. Vehicle Permit");
            if (!transSpeedGovernor) errors.push("4. Speed Governor");
            if (!transVehicleExterior) errors.push("5. Vehicle Exterior Norms");
            if (!transSchoolBusProminent) errors.push("6. 'SCHOOL BUS' Prominent");
            if (!transHiredBusDuty) errors.push("7. 'ON SCHOOL DUTY'");
            if (!transSchoolNameWritten) errors.push("8. School Name on Bus");
            if (!transDriverExperience) errors.push("9. Driver Experience");
            if (!transDriverNoTrafficOffences) errors.push("10. Driver Traffic Offence Record");
            if (!transAutoSafety) errors.push("28. Auto Safety");
            if (!transAutoParentInstruction) errors.push("29. Auto Parent Instruction");
            if (!transAutoRegistered) errors.push("30. Auto Registration");
        }

        if (errors.length > 0) {
            setValidationErrors(errors);
            setShowValidationPopup(true);
            return false;
        }
        return true;
    };

    // next is now handleNext (defined above with API save)
    const next = handleNext;
    const prev = () => {
        setCurrentStep((s) => Math.max(s - 1, 0));
        window.scrollTo(0, 0);
    };

    // Check if school has Grade 1 (for Vidya Pravesh conditional visibility)
    const hasGrade1 = true; // This should be derived from actual data in a real implementation

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-neutral-900">Profile Completion</h1>
                <p className="text-neutral-500 mt-1">Complete all sections to submit your application</p>
            </div>

            {/* Progress */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-neutral-700">Overall Progress</span>
                    <span className="text-sm font-bold text-primary-600">{progress}%</span>
                </div>
                <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Step Indicator */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 mb-6 overflow-x-auto">
                <div className="flex items-center min-w-max">
                    {steps.map((step, i) => (
                        <div key={step} className="flex items-center">
                            <button
                                onClick={() => setCurrentStep(i)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${i === currentStep
                                    ? "bg-primary-600 text-white shadow-md"
                                    : i < currentStep
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "text-neutral-400 hover:text-neutral-600"
                                    }`}
                            >
                                <span
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i === currentStep
                                        ? "bg-white text-primary-600"
                                        : i < currentStep
                                            ? "bg-emerald-500 text-white"
                                            : "bg-neutral-200 text-neutral-500"
                                        }`}
                                >
                                    {i < currentStep ? <FiCheck size={12} /> : i + 1}
                                </span>
                                <span className="hidden sm:inline">{step}</span>
                            </button>
                            {i < steps.length - 1 && (
                                <div className={`w-8 h-0.5 mx-1 ${i < currentStep ? "bg-emerald-300" : "bg-neutral-200"}`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 lg:p-8">
                <h2 className="text-xl font-bold text-neutral-800 mb-6">
                    {steps[currentStep]}
                </h2>

                {/* Step 1: Basic Details */}
                {currentStep === 0 && (
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-semibold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">1.1 School Identity</h3>
                            <div className="grid md:grid-cols-2 gap-5">
                                <InputField label="1.1 School Name (In capital letters)" value={schoolName} onChange={(e) => setSchoolName(e.target.value.toUpperCase())} required={true} />
                                <div className="flex items-end gap-3">
                                    <div className="flex-1">
                                        <InputField label="UDISE Number" value={udiseNumber} onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                                            setUdiseNumber(val);
                                        }} placeholder="11-digit UDISE Number" required={true} />
                                    </div>
                                    <button 
                                        type="button" 
                                        className="h-[42px] px-6 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-sm"
                                        onClick={() => {
                                            if (udiseNumber.length === 11) {
                                                alert("UDISE Number Verified Successfully!");
                                            } else {
                                                alert("Please enter a valid 11-digit UDISE Number to verify.");
                                            }
                                        }}
                                    >
                                        Verify
                                    </button>
                                </div>
                                <InputField label="Year of Establishment" value={estYear} onChange={(e) => setEstYear(e.target.value)} type="number" placeholder="e.g. 1995" required />
                                <SelectField label="Board Affiliation" value={boardAffiliation} onChange={(e) => setBoardAffiliation(e.target.value)} options={["CBSE", "ICSE", "State Board", "IB", "Other"]} required />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">1.2 School Contact Details</h3>
                            <div className="grid md:grid-cols-2 gap-5">
                                <InputField label="(a) STD Code" value={stdCode} onChange={(e) => setStdCode(e.target.value)} placeholder="STD Code" />
                                <InputField label="(b) Landline Number" value={landline} onChange={(e) => setLandline(e.target.value)} placeholder="Landline Number" />
                                <InputField label="(c) Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Mobile Number" required />
                                <InputField label="(d) Email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" required />
                                <div className="md:col-span-2">
                                    <InputField label="(e) Website of the School" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">1.3 Head of the School (HoS) / In-Charge Details</h3>
                            <div className="grid md:grid-cols-2 gap-5">
                                <SelectField
                                    label="(a) HoS / In-Charge Type"
                                    options={[
                                        "1- Head Master/Principal",
                                        "2- Asst. Head Master/Vice Principal",
                                        "3-Acting Head Teacher",
                                        "4-In-Charge from Other School",
                                        "5-In-Charge from Block/District",
                                        "6-Others"
                                    ]}
                                />
                                <InputField label="(b) HoS /In-Charge Name" placeholder="Full Name" />
                                <InputField label="(c) Mobile Number" placeholder="Mobile Number" />
                                <InputField label="(d) HoS Email" type="email" placeholder="HoS Email" />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">1.4 Management Details</h3>
                            <div className="grid md:grid-cols-2 gap-5">
                                <SelectField
                                    label="(a) Management Group of the School"
                                    value={managementGroup}
                                    onChange={(e) => {
                                        setManagementGroup(e.target.value);
                                        setManagementCode(""); // Reset code when group changes
                                    }}
                                    options={[
                                        "A- State Government",
                                        "B – Govt. Aided",
                                        "C- Private Unaided",
                                        "D- Central Government",
                                        "E- Others"
                                    ]}
                                    required
                                />

                                <SelectField
                                    label="(b) Management Code of School"
                                    value={managementCode}
                                    disabled={!managementGroup}
                                    onChange={(e) => setManagementCode(e.target.value)}
                                    options={
                                        managementGroup.startsWith("A") ? ["1 Department of Education", "2 Tribal Welfare Department", "3 Local Body", "6 Other State Govt. Managed", "89 Minority Affairs Department", "90 Social Welfare Department", "91 Ministry of Labour"] :
                                            managementGroup.startsWith("B") ? ["4 Government Aided", "7 Partially Govt. Aided"] :
                                                managementGroup.startsWith("C") ? ["5 Private Unaided (Recognized)"] :
                                                    managementGroup.startsWith("D") ? ["92 Kendriya Vidyalaya Sangathan", "93 Navodaya Vidyalaya Samiti", "94 Sainik School", "95 Railway School", "96 Central Tibetan School", "101 Other Central Govt./PSU Schools**"] :
                                                        managementGroup.startsWith("E") ? ["97 Madrasa Private Unaided (Recognized)", "99 Madrasa Aided (Recognized)", "102 Veda Schools/Gurukuls/Pathashalas (Aided/Unaided)"] :
                                                            []
                                    }
                                />

                                {managementCode.includes("101") && (
                                    <div className="md:col-span-2">
                                        <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 mb-4">
                                            <p className="text-sm font-medium text-primary-800 mb-3">**For Management Code 101 Details</p>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <InputField label="Mention Nodal Ministry/Dept" placeholder="Nodal Ministry/Dept" />
                                                <SelectField
                                                    label="Administration Type"
                                                    options={[
                                                        "1-Autonomous body under Ministry/Dept",
                                                        "2-PSU under Ministry/Dept.",
                                                        "3- Society under Ministry/Dept"
                                                    ]}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">1.5 & 1.6 School Classification & Sub-Management</h3>
                            <div className="grid md:grid-cols-2 gap-5">
                                <SelectField
                                    label="1.5 Classification of School"
                                    value={classification}
                                    onChange={(e) => setClassification(e.target.value)}
                                    options={["1-Formal School", "2-Special School for CWSN"]}
                                />

                                {classification.includes("2") && (
                                    <SelectField
                                        label="TYPE of Special School"
                                        options={[
                                            "1-Visual impairments",
                                            "2-Hearing impairments",
                                            "3-Motor impairments",
                                            "4-Cognitive impairments",
                                            "5-All Types",
                                            "6-Others"
                                        ]}
                                    />
                                )}

                                <SelectField
                                    label="1.6 Sub-Management (if any)"
                                    value={subManagement}
                                    onChange={(e) => setSubManagement(e.target.value)}
                                    disabled={!managementCode}
                                    options={
                                        managementCode.startsWith("1 ") ? ["KGBV", "Netaji Subhash Chandra Bose Abasiya Vidyalaya"] :
                                            managementCode.startsWith("2 ") ? ["Eklavya Model Residential School"] :
                                                managementCode.startsWith("5 ") ? ["Army Public School", "Air force School", "Navy Education Society"] :
                                                    managementCode.startsWith("102 ") ? ["MSRVVP"] :
                                                        []
                                    }
                                />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">Infrastructure & Category</h3>
                            <div className="grid md:grid-cols-2 gap-5">
                                <SelectField label="1.7 Is this a PM-SHRI School?" value={isPmShri} onChange={(e) => setIsPmShri(e.target.value)} options={["1-Yes", "2-No"]} />
                                <SelectField
                                    label="1.10 School Category"
                                    value={schoolCategory}
                                    onChange={(e) => setSchoolCategory(e.target.value)}
                                    options={[
                                        "1- Primary only with grades 1 to 5 (PRY)",
                                        "2- Upper Primary with grades 1 to 8 (PRY-UPR)",
                                        "3- Higher Secondary with grades 1 to 12 (PRY-UPR-SEC-HSEC)",
                                        "4- Upper Primary only with grades 6 to 8 (UPR)",
                                        "5- Higher Secondary with grades 6 to 12 (UPR-SEC-HSEC)",
                                        "6- Secondary with grades 1 to 10 (PRY-UPR-SEC)",
                                        "7- Secondary with grades 6 to 10 (UPR-SEC)",
                                        "8- Secondary only with grades 9 \u0026 10 (SEC)",
                                        "10- Higher Secondary with grades 9 to 12 (SEC-HSEC)",
                                        "11- Hr. Sec. /Jr. College only with grades 11 \u0026 12 (HSEC)",
                                        "12- Pre-Primary Only (PRE)"
                                    ]}
                                    required
                                />
                                <SelectField label="1.9 Type of the School" value={schoolType} onChange={(e) => setSchoolType(e.target.value)} options={["1-Boys", "2-Girls", "3-Co-Educational"]} />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">1.10 Classes and Streams Availability</h3>
                            <div className="space-y-6">
                                {/* (a) Class Levels */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-neutral-700">
                                        (a) Lowest and Highest Class in School ({
                                            applicationType === "New Recognition" ? "Proposed" :
                                                applicationType === "Renewal" ? "Current" : "To be changed"
                                        }):
                                    </label>
                                    <div className="flex items-center gap-4 max-w-sm">
                                        <SelectField label="1.17 Lowest Class" value={lowestClass} onChange={(e) => setLowestClass(e.target.value)} options={["Nursery", "LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]} required={true} />
                                        <span className="text-neutral-400 font-bold">TO</span>
                                        <InputField label="" value={highestClass} onChange={(e) => setHighestClass(e.target.value)} placeholder="Class e.g. 10" />
                                    </div>
                                </div>

                                {/* (b) Pre-Primary Details */}
                                <div className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-5">
                                        <SelectField
                                            label={`(b) Whether Pre-Primary/Balvatika section (other than Anganwadi) attached to school? ${applicationType === "New Recognition" ? "(Required if applicable)" :
                                                applicationType === "Renewal" ? "(Required Confirmation)" :
                                                    "(Required if adding PP)"
                                                }`}
                                            value={hasPrePrimary}
                                            onChange={(e) => setHasPrePrimary(e.target.value)}
                                            options={["1-Yes", "2-No"]}
                                        />
                                        {hasPrePrimary === "1-Yes" && (
                                            <InputField
                                                label="Number of Classes/Grades in Pre-Primary Section"
                                                placeholder="e.g. 3"
                                                type="number"
                                            />
                                        )}
                                    </div>

                                    {/* Note removed per user request */}
                                </div>

                                {/* (c) Streams Availability */}
                                {(schoolCategory.startsWith("3") || schoolCategory.startsWith("5") || schoolCategory.startsWith("10") || schoolCategory.startsWith("11")) && (
                                    <div className="space-y-4 pt-4 border-t border-dotted border-neutral-200">
                                        <p className="text-sm font-semibold text-neutral-800">(c) Streams Available in the School (in case of Schools with Higher Secondary Sections)</p>
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse border border-neutral-200 text-sm">
                                                <thead>
                                                    <tr className="bg-neutral-50 text-neutral-700">
                                                        <th className="border border-neutral-200 px-4 py-2 text-left">Streams</th>
                                                        <th className="border border-neutral-200 px-4 py-2 text-left w-40">
                                                            {applicationType === "New Recognition" ? "Requesting (1-Yes/2-No)" :
                                                                applicationType === "Renewal" ? "Availability (1-Yes/2-No)" :
                                                                    "To be Added (1-Yes/2-No)"}
                                                        </th>
                                                        <th className="border border-neutral-200 px-4 py-2 text-left">Subjects Offered/Taught in School in Streams</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {["Arts Stream", "Science Stream", "Commerce Stream", "Vocational Stream", "Other Stream"].map((stream) => (
                                                        <tr key={stream}>
                                                            <td className="border border-neutral-200 px-4 py-2 font-medium">{stream}</td>
                                                            <td className="border border-neutral-200 px-4 py-1">
                                                                <select className="w-full bg-transparent focus:outline-none text-sm">
                                                                    <option value="">Select</option>
                                                                    <option value="1">1-Yes</option>
                                                                    <option value="2">2-No</option>
                                                                </select>
                                                            </td>
                                                            <td className="border border-neutral-200 px-4 py-1">
                                                                <div className="flex flex-col gap-1.5 py-1">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Enter subjects..."
                                                                        className="w-full bg-transparent focus:outline-none text-sm font-medium text-primary-700"
                                                                    />
                                                                    <div className="flex flex-wrap gap-1">
                                                                        <span className="text-[10px] text-neutral-400 self-center mr-1">Suggestions:</span>
                                                                        {stream === "Arts Stream" && ["History", "Pol Science", "Geography"].map(s => <button key={s} className="px-1.5 py-0.5 bg-neutral-100 rounded text-[9px] text-neutral-500 hover:bg-primary-100 hover:text-primary-600 transition-colors">+{s}</button>)}
                                                                        {stream === "Science Stream" && ["Physics", "Chemistry", "Biology", "Math"].map(s => <button key={s} className="px-1.5 py-0.5 bg-neutral-100 rounded text-[9px] text-neutral-500 hover:bg-primary-100 hover:text-primary-600 transition-colors">+{s}</button>)}
                                                                        {stream === "Commerce Stream" && ["Accountancy", "Economics", "Business St."].map(s => <button key={s} className="px-1.5 py-0.5 bg-neutral-100 rounded text-[9px] text-neutral-500 hover:bg-primary-100 hover:text-primary-600 transition-colors">+{s}</button>)}
                                                                        {stream === "Vocational Stream" && ["IT", "Tourism", "Health Care"].map(s => <button key={s} className="px-1.5 py-0.5 bg-neutral-100 rounded text-[9px] text-neutral-500 hover:bg-primary-100 hover:text-primary-600 transition-colors">+{s}</button>)}
                                                                    </div>
                                                                    <p className="text-[9px] text-neutral-400 italic">
                                                                        (selectable from Given Options in final form)
                                                                    </p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 1.19 & 1.20 Affiliation Details */}
                        {(() => {
                            const categoryCode = schoolCategory.split('-')[0].trim();
                            const isSecondary = ["3", "6", "7", "8", "10"].includes(categoryCode);
                            const isHigherSecondary = ["3", "5", "10", "11"].includes(categoryCode);

                            if (!isSecondary && !isHigherSecondary) return null;

                            const boardOptions = [
                                "1-CBSE",
                                "2-State Board",
                                "3-ICSE",
                                "4-International Board",
                                "7-Madarsa Board",
                                "8-Sanskrit Board",
                                "10-University Affiliated Board"
                            ];

                            return (
                                <div className="space-y-6 pt-6 border-t border-neutral-100">
                                    {isSecondary && (
                                        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
                                            <h3 className="text-lg font-semibold text-neutral-800 pb-2 border-b border-neutral-100">1.11 Affiliation Details (SECONDARY Section)</h3>
                                            <div className="grid md:grid-cols-2 gap-5">
                                                <SelectField label="(a) Affiliation Board type" options={boardOptions} />
                                                <InputField label="(b) Name of the Affiliation Board" placeholder="Enter name of board" />
                                                <InputField label="(c) Affiliation Number" placeholder="Enter affiliation number" />
                                            </div>
                                        </div>
                                    )}

                                    {isHigherSecondary && (
                                        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
                                            <h3 className="text-lg font-semibold text-neutral-800 pb-2 border-b border-neutral-100">1.12 Affiliation Details (HIGHER SECONDARY Section)</h3>
                                            <div className="grid md:grid-cols-2 gap-5">
                                                <SelectField label="(a) Affiliation Board type" options={boardOptions} />
                                                <InputField label="(b) Name of the Affiliation Board" placeholder="Enter name of board" />
                                                <InputField label="(c) Affiliation Number" placeholder="Enter affiliation number" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
                            <h3 className="text-lg font-semibold text-neutral-800 pb-2 border-b border-neutral-100">Respondent & Session Details</h3>

                            {/* 1.21 Respondent Details */}
                            <div className="space-y-4">
                                <label className="block text-sm font-semibold text-neutral-800">1.13 Respondent Details :(*Respondent = Person actually Responsible for filling this form)</label>
                                <div className="grid md:grid-cols-2 gap-5">
                                    <SelectField
                                        label="(a) Respondent Type"
                                        options={[
                                            "1- Head of the School/In-Charge",
                                            "2- Teacher",
                                            "3- School Administration Staff/Official/Clerk",
                                            "4- In-Charge from Block/District/Cluster",
                                            "5- In-Charge from Other School"
                                        ]}
                                    />
                                    <InputField label="(b) Name" placeholder="Enter full name" />
                                    <InputField label="(c) Mobile Number" placeholder="Enter 10-digit mobile" />
                                    <InputField label="(d) Email" placeholder="Enter email address" type="email" />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 pt-4 border-t border-dotted border-neutral-200">
                                {/* 1.22 Academic Session */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-semibold text-neutral-800">
                                        1.14 Academic session Start and End Date in Current Year?
                                        <span className="block text-[10px] text-neutral-400 font-normal mt-0.5">(e.g. 5th July to be mentioned as 05/07)</span>
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <InputField label="" placeholder="DD/MM" />
                                        <span className="text-neutral-400 font-bold">TO</span>
                                        <InputField label="" placeholder="DD/MM" />
                                    </div>
                                </div>

                                {/* 1.23 Year of Establishment */}
                                <div>
                                    <InputField
                                        label="1.15 Year of Establishment of school:"
                                        placeholder="YYYY (e.g. 1995)"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-neutral-800 mb-2 pb-2 border-b border-neutral-100">1.16 Recognition & Upgradation Details</h3>
                            <div className="mb-6">
                                <SelectField
                                    label="Type of Application"
                                    value={applicationType}
                                    onChange={(e) => setApplicationType(e.target.value)}
                                    options={["New Recognition", "Renewal", "Upgradation"]}
                                />
                            </div>

                            <div className="overflow-x-auto mb-6">
                                <table className="w-full border-collapse border border-neutral-200 text-sm">
                                    <thead>
                                        <tr className="bg-neutral-50 text-neutral-700">
                                            <th className="border border-neutral-200 px-4 py-2 text-left w-16">Sl No</th>
                                            <th className="border border-neutral-200 px-4 py-2 text-left">Broad Category</th>
                                            <th className="border border-neutral-200 px-4 py-2 text-left">
                                                {applicationType === "New Recognition" ? "Requesting Recognition (Yes/No)" : "Recognized (Yes/No)"}
                                            </th>
                                            <th className="border border-neutral-200 px-4 py-2 text-left">
                                                {applicationType === "New Recognition" ? "Proposed Year of Operation / Establishment" : "Recognition Year"}
                                            </th>
                                            {(applicationType === "Renewal" || applicationType === "Upgradation") && (
                                                <th className="border border-neutral-200 px-4 py-2 text-left">Certificate Number</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { id: 1, label: "Pre-Primary" },
                                            { id: 2, label: "Primary" },
                                            { id: 3, label: "Upper Primary" },
                                            { id: 4, label: "Secondary" },
                                            { id: 5, label: "Higher Secondary" },
                                        ].map((row) => (
                                            <tr key={row.id}>
                                                <td className="border border-neutral-200 px-4 py-2 text-center">{row.id}</td>
                                                <td className="border border-neutral-200 px-4 py-2">{row.label}</td>
                                                <td className="border border-neutral-200 px-4 py-1">
                                                    <select className="w-full bg-transparent focus:outline-none">
                                                        <option value="">Select</option>
                                                        <option value="1">1-Yes</option>
                                                        <option value="2">2-No</option>
                                                    </select>
                                                </td>
                                                <td className="border border-neutral-200 px-4 py-1">
                                                    <input
                                                        type="text"
                                                        placeholder={applicationType === "New Recognition" ? "Year" : "Year"}
                                                        className="w-full bg-transparent focus:outline-none"
                                                    />
                                                </td>
                                                {(applicationType === "Renewal" || applicationType === "Upgradation") && (
                                                    <td className="border border-neutral-200 px-4 py-1">
                                                        <input
                                                            type="text"
                                                            placeholder="Cert No."
                                                            className="w-full bg-transparent focus:outline-none"
                                                        />
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="space-y-4">
                                <p className="text-sm font-semibold text-neutral-700">1.17 (b) Year of upgradation of the school (if applicable):</p>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <InputField label="(a) Primary to Upper Primary" placeholder="YYYY" />
                                    <InputField label="(b) Upper Primary to Secondary" placeholder="YYYY" />
                                    <InputField label="(c) Secondary to Higher secondary" placeholder="YYYY" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-neutral-800 mb-2 pb-2 border-b border-neutral-100">Documents</h3>
                            <div className="grid md:grid-cols-2 gap-5">
                                <UploadField label="Registration Certificate" />
                                <UploadField label="Trust Certificate" />
                                {(applicationType === "Renewal" || applicationType === "Upgradation") && (
                                    <div className="md:col-span-2">
                                        <UploadField label="Current Recognition Certificate(s)" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
                            <h3 className="text-lg font-semibold text-neutral-800 pb-2 border-b border-neutral-100">1.18 Medium of instruction(s) in the School</h3>
                            <p className="text-sm italic text-neutral-600 mb-4">
                                [Mention Mediums (if more than one) according to Number of Students taught in any particular Medium in descending order. Largest Medium should come first.]
                            </p>
                            <div className="grid md:grid-cols-2 gap-x-8 gap-y-5">
                                <SelectField label="(i) Medium-1:" options={LANGUAGES} />
                                <SelectField label="(ii) Medium-2:" options={LANGUAGES} />
                                <SelectField label="(iii) Medium-3:" options={LANGUAGES} />
                                <SelectField label="(iv) Medium-4:" options={LANGUAGES} />
                            </div>
                            <div className="mt-6 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                                <p className="text-[10px] leading-relaxed text-neutral-500 font-medium">
                                    (01-Assamese, 02-Bengali, 03-Gujarati, 04-Hindi, 05-Kannada, 06-Kashmiri, 07-Konkani, 08-Malayalam, 09-Manipuri, 10-Marathi, 11-Nepali, 12-Odia, 13-Punjabi, 14-Sanskrit, 15-Sindhi, 16-Tamil, 17-Telugu, 18-Urdu, 19-English, 20-Bodo, 22-Dogri, 23-Khasi, 24-Garo, 25-Mizo, 26-Bhutia, 27-Lepcha, 28-Limboo, 29-French, 30-Hmar, 31-Bishnupriya Manipuri, 32-Karbi, 39-Santhali, 49-Bhodi (Ladakhi), 51-Maithali, 71-Balti, 72-Purgi, 73-Tibetian, 97-Foreign Medium)
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
                            <h3 className="text-lg font-semibold text-neutral-800 pb-2 border-b border-neutral-100">1.19 Language Groups(s) taught as a subject:</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-neutral-200 text-sm">
                                    <thead>
                                        <tr className="bg-neutral-50 text-neutral-700">
                                            <th className="border border-neutral-200 px-4 py-3 text-left">1.19 Language Group(s) taught as Subjects</th>
                                            <th className="border border-neutral-200 px-4 py-3 text-left w-64">Category Level(s)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { placeholder: "Example: 1st: 04-Hindi, 2nd: 19-English" },
                                            { placeholder: "Example: 1st: 04-Hindi, 2nd: 19-English, 3rd: 14-Sanskrit" },
                                            { placeholder: "Example: 1st: 04-Hindi, 2nd: 19-English" },
                                        ].map((row, idx) => (
                                            <tr key={idx}>
                                                <td className="border border-neutral-200 px-4 py-2">
                                                    <input
                                                        type="text"
                                                        placeholder={row.placeholder}
                                                        className="w-full bg-transparent focus:outline-none placeholder:text-neutral-300 text-primary-700 font-medium"
                                                    />
                                                </td>
                                                <td className="border border-neutral-200 px-4 py-2">
                                                    <select className="w-full bg-transparent focus:outline-none text-neutral-600">
                                                        <option value="">Select Level</option>
                                                        <option value="Primary">Primary</option>
                                                        <option value="Upper Primary">Upper Primary</option>
                                                        <option value="Secondary">Secondary</option>
                                                        <option value="Higher Secondary">Higher Secondary</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                                <p className="text-[10px] leading-relaxed text-neutral-500 font-medium italic">
                                    (1-Assamese, 2-Bengali, 3-Gujarati, 4-Hindi, 5-Kannada, 6-Kashmiri, 7-Konkani, 8-Malayalam, 9-Manipuri, 10-Marathi, 11-Nepali, 12-Odia, 13-Punjabi, 14-Sanskrit, 15-Sindhi, 16-Tamil, 17-Telugu, 18-Urdu, 19-English, 20-Bodo, 22-Dogri, 23-Khasi, 24-Garo, 25-Mizo, 26-Bhutia, 27-Lepcha, 28-Limbo, 29-French, 30-Hmar, 32-Karbi, 39-Santhali, 41-Angami, 42-Ao, 43-Arabic, 46-German, 47-Kakbarak, 48-Konyak, 49-Bhoti, 50-Lotha, 51-Maithili, 53-Nicobaree, 54-Persian, 55-Portuguese, 56-Rajasthani, 57-Russian, 58-Sema, 59-Spanish, 60-Tibetan, 61-Zeliang, 62-Mundari, 64-Kuruk, 65-Ho, 72-Purgi, 74-Tamang, 75-Gurung, 76-Sherpa, 77-Rai, 78-Mangar, 79-Mukhia, 80-Newar, 81-Korean, 82-Japanese, 96-Alt-English, 101-Tangkhul, 102-Thadou, 103-Paite, 104-Zou, 105-Kom, 106-Vaiphei, 107-Mao, 108-Ruangmei, 109-Liangmei, 111-Gangte, 112-Simte, 113-Poula, 114-Anal, 115-Maring, 116-Maram, 117-Zeme, 118-GFC, 119-Nyishi, 120-Galo, 121-Tagin, 122-Wangcho, 123-Tangsa, 124-Idu, 125-Kaman, 126-Taraon, 127-Adi, 128-Chokri, 129-Khuzhale, 130-Chang, 131-Khiamuniungan, 132-Kuki, 133-Phom, 134-Pochury, 135-Nethenyi, 136-Nzonkhwe, 137-Sangtam, 138-Yimkhiung, 139-Laica, 140-Chakma, 141-Mara, 142-Apatani, 143-Singpho, 144-Tutsa, 145-Tai-Khamti)
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
                            <h3 className="text-lg font-semibold text-neutral-800 pb-2 border-b border-neutral-100">1.20 & 1.21 Curriculum & Minority Details</h3>

                            <div className="space-y-4">
                                <p className="text-sm font-semibold text-neutral-700 bg-yellow-50 px-2 py-1 rounded">1.20 (a) Curriculum followed by School in PRIMARY Section?</p>
                                <SelectField
                                    label="(1-NCERT / 2-State / 3-Others)"
                                    value={curriculumPrimary}
                                    onChange={(e) => setCurriculumPrimary(e.target.value)}
                                    options={["1-NCERT", "2-State", "3-Others"]}
                                />

                                <p className="text-sm font-semibold text-neutral-700 bg-yellow-50 px-2 py-1 rounded mt-4">(b) Curriculum followed by School in UPPER PRIMARY Section?</p>
                                <SelectField
                                    label="(1-NCERT / 2-State / 3-Others)"
                                    value={curriculumUpperPrimary}
                                    onChange={(e) => setCurriculumUpperPrimary(e.target.value)}
                                    options={["1-NCERT", "2-State", "3-Others"]}
                                />
                            </div>

                            <div className="pt-6 border-t border-dotted border-neutral-200 space-y-5">
                                <div className="grid md:grid-cols-2 gap-5 items-end">
                                    <SelectField
                                        label="1.21 Is this a minority managed school?"
                                        value={isMinority}
                                        onChange={(e) => setIsMinority(e.target.value)}
                                        options={["1-Yes", "2-No"]}
                                    />
                                    <p className="text-[10px] text-neutral-400 italic mb-2">
                                        (Applicable only for Govt. Aided / Pvt. Unaided / Others Management Group Schools)
                                    </p>
                                </div>

                                {isMinority === "1-Yes" && (
                                    <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <SelectField
                                            label="If 1-Yes, Type of Minority Community Managing the school:"
                                            value={minorityCommunity}
                                            onChange={(e) => setMinorityCommunity(e.target.value)}
                                            options={[
                                                "1-Muslim",
                                                "2-Sikh",
                                                "3-Jain",
                                                "4-Christian",
                                                "5-Parsi",
                                                "6-Buddhist",
                                                "8-Linguistic Minority"
                                            ]}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
                            <h3 className="text-lg font-semibold text-neutral-800 pb-2 border-b border-neutral-100">1.22 & 1.23 RTE & Vocational Details</h3>

                            <div className="space-y-4">
                                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                                    <p className="text-[10px] font-bold text-primary-700 uppercase tracking-wider mb-2">Question No 1.22 is Only for Private Unaided Schools (To be SET from ADMIN level)</p>
                                    <SelectField
                                        label="1.22 Does the School take admission under Section 12 of the RTE Act (25% Quota of entry-level seats as per the RTE Act)?"
                                        value={isRTE}
                                        onChange={(e) => setIsRTE(e.target.value)}
                                        options={["1-Yes", "2-No"]}
                                    />
                                </div>

                                <div className="pt-6 border-t border-dotted border-neutral-200 space-y-4">
                                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                                        <p className="text-[10px] font-bold text-primary-700 uppercase tracking-wider mb-1">Information on Vocational Courses Availability (To be SET from ADMIN level)</p>
                                        <p className="text-[10px] text-neutral-400 italic mb-2">(For All Management Schools and for Secondary/Higher Secondary/Upper-Primary Sections)</p>
                                        <SelectField
                                            label="1.23 Does the school provide any vocational courses under NSQF aligned job role/skill courses?"
                                            value={isVocational}
                                            onChange={(e) => setIsVocational(e.target.value)}
                                            options={["1-Yes", "2-No"]}
                                        />
                                    </div>

                                    {isVocational === "1-Yes" && (
                                        <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 animate-in fade-in slide-in-from-top-2 duration-300 space-y-6">
                                            <p className="text-xs font-bold text-primary-800 italic">If Answer of 1.23 is 1-YES, then only answer all remaining sections</p>

                                            <div className="space-y-4">
                                                <SelectField
                                                    label="(a) Vocational/Skill Courses covered under:"
                                                    value={fundingSource}
                                                    onChange={(e) => setFundingSource(e.target.value)}
                                                    options={["1-Centrally Sponsored Scheme", "2-State sponsored scheme", "3-NONE"]}
                                                />
                                                <p className="text-[10px] text-neutral-400 italic -mt-2">
                                                    (Note: For New Recognition, usually select 3-NONE)
                                                </p>

                                                {(fundingSource === "1-Centrally Sponsored Scheme" || fundingSource === "2-State sponsored scheme") && (
                                                    <InputField
                                                        label="Sanction Order Number (Mandatory for Govt. Support)"
                                                        value={sanctionOrderNumber}
                                                        onChange={(e) => setSanctionOrderNumber(e.target.value)}
                                                        placeholder="Enter sanction order number"
                                                    />
                                                )}
                                            </div>

                                            <div className="space-y-4">
                                                <p className="text-sm font-semibold text-neutral-700">(b) Sector(s) / Job Roles(s) available in the school:</p>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full border-collapse border border-neutral-200 text-[10px]">
                                                        <thead>
                                                            <tr className="bg-neutral-100 text-neutral-700">
                                                                <th className="border border-neutral-200 p-2 text-center w-8">Sl. No.</th>
                                                                <th className="border border-neutral-200 p-2 text-left w-32">Grade (1=IX-X / 2=XI-XII)</th>
                                                                <th className="border border-neutral-200 p-2 text-left w-48">Sector(s) with Code</th>
                                                                <th className="border border-neutral-200 p-2 text-left">Job Roles with Code</th>
                                                                <th className="border border-neutral-200 p-2 text-center w-24">Year of Starting</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {vocationalRows.map((row, idx) => (
                                                                <tr key={idx} className="bg-white">
                                                                    <td className="border border-neutral-200 p-1 text-center font-medium text-neutral-500">
                                                                        {idx % 2 === 0 ? `Sector${Math.floor(idx / 2) + 1}` : ""}
                                                                    </td>
                                                                    <td className="border border-neutral-200 p-1">
                                                                        <select
                                                                            value={row.grade}
                                                                            onChange={(e) => {
                                                                                const newRows = [...vocationalRows];
                                                                                newRows[idx].grade = e.target.value;
                                                                                setVocationalRows(newRows);
                                                                            }}
                                                                            className="w-full bg-transparent focus:outline-none"
                                                                        >
                                                                            <option value="">Select</option>
                                                                            <option value="1">1 (IX-X)</option>
                                                                            <option value="2">2 (XI-XII)</option>
                                                                        </select>
                                                                    </td>
                                                                    <td className="border border-neutral-200 p-1">
                                                                        <select
                                                                            value={row.sector}
                                                                            onChange={(e) => {
                                                                                const newRows = [...vocationalRows];
                                                                                newRows[idx].sector = e.target.value;
                                                                                setVocationalRows(newRows);
                                                                            }}
                                                                            className="w-full bg-transparent focus:outline-none"
                                                                        >
                                                                            <option value="">Select Sector</option>
                                                                            {VOCATIONAL_SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                                                                        </select>
                                                                    </td>
                                                                    <td className="border border-neutral-200 p-1">
                                                                        <input
                                                                            type="text"
                                                                            value={row.jobRole}
                                                                            onChange={(e) => {
                                                                                const newRows = [...vocationalRows];
                                                                                newRows[idx].jobRole = e.target.value;
                                                                                setVocationalRows(newRows);
                                                                            }}
                                                                            placeholder="e.g. Data Entry Operator"
                                                                            className="w-full bg-transparent focus:outline-none px-1"
                                                                        />
                                                                    </td>
                                                                    <td className="border border-neutral-200 p-1 text-center">
                                                                        <input
                                                                            type="text"
                                                                            value={row.yearStarting}
                                                                            onChange={(e) => {
                                                                                const newRows = [...vocationalRows];
                                                                                newRows[idx].yearStarting = e.target.value;
                                                                                setVocationalRows(newRows);
                                                                            }}
                                                                            placeholder="YYYY"
                                                                            className="w-full bg-transparent focus:outline-none text-center"
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="p-3 bg-primary-100/50 rounded-xl border border-primary-200">
                                                    <p className="text-[10px] text-primary-800 leading-normal">
                                                        <span className="font-bold">Usage Logic:</span><br />
                                                        • <span className="font-bold">New Recognition:</span> Declare intended sectors to verify lab capacity.<br />
                                                        • <span className="font-bold">Recognition Renewal:</span> Audit mode; list all active courses.<br />
                                                        • <span className="font-bold">Upgradatiton:</span> expansion mode; apply for new courses in higher grades.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-6">
                            <div className="grid md:grid-cols-2 gap-5">
                                <SelectField
                                    label="1.24 Does the school offer any pre-vocational exposure at Upper-Primary stage?"
                                    value={isPreVocational}
                                    onChange={(e) => setIsPreVocational(e.target.value)}
                                    options={["1-Yes", "2-No"]}
                                />
                                <SelectField
                                    label="1.25 Does the school run any skill training center after school hours?"
                                    value={isSkillCenter}
                                    onChange={(e) => setIsSkillCenter(e.target.value)}
                                    options={["1-Yes", "2-No"]}
                                />
                            </div>

                            <div className="space-y-4">
                                <SelectField
                                    label="1.26 Is this a Residential School?"
                                    value={isResidential}
                                    onChange={(e) => {
                                        setIsResidential(e.target.value);
                                        setResidentialType("");
                                    }}
                                    options={["1-Completely Residential", "2-Partially Residential", "3-Non-Residential"]}
                                />

                                {(isResidential === "1-Completely Residential" || isResidential === "2-Partially Residential") && (
                                    <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 animate-in fade-in slide-in-from-top-2 duration-300 space-y-3">
                                        <SelectField
                                            label="(a) Type of Residential school:"
                                            value={residentialType}
                                            onChange={(e) => setResidentialType(e.target.value)}
                                            options={
                                                (managementGroup.startsWith("A") || managementGroup.startsWith("D"))
                                                    ? [
                                                        "1-Ashram (Govt.)",
                                                        "2- Non-Ashram (Govt.)",
                                                        "6-KGBV",
                                                        "7-Model School",
                                                        "8- Eklavya Model Residential School",
                                                        "10-Jawahar Navodaya Vidyalaya",
                                                        "11-Netaji Subhash Residential School"
                                                    ]
                                                    : ["3- Private", "4-Others"]
                                            }
                                        />
                                        <p className="text-[10px] text-amber-600 font-medium italic">
                                            Note: Residential status will require hostel-specific safety and hygiene documentation.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <SelectField
                                label="1.27 Is this a Shift School?"
                                value={isShift}
                                onChange={(e) => setIsShift(e.target.value)}
                                options={["1-Yes", "2-No"]}
                            />
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-8">
                            <SelectField
                                label="1.28 Are majority of the pupils taught through their mother tongue at the Primary level?"
                                value={isMotherTongue}
                                onChange={(e) => setIsMotherTongue(e.target.value)}
                                options={["1-Yes", "2-No"]}
                            />

                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-neutral-800">
                                    1.29 Distance* of the school (in km.) from the nearest Govt./ Govt. Aided school:
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField
                                        label="(a) From Primary School/Section"
                                        value={distPrimary}
                                        onChange={(e) => setDistPrimary(e.target.value)}
                                        placeholder="e.g. 2.6"
                                    />
                                    <InputField
                                        label="(b) From Upper primary School/Section"
                                        value={distUpperPrimary}
                                        onChange={(e) => setDistUpperPrimary(e.target.value)}
                                        placeholder="e.g. 3.1"
                                    />
                                    <InputField
                                        label="(c) From Secondary School/Section"
                                        value={distSecondary}
                                        onChange={(e) => setDistSecondary(e.target.value)}
                                        placeholder="e.g. 5.0"
                                    />
                                    <InputField
                                        label="(d) From Higher Secondary School/Junior college"
                                        value={distHigherSecondary}
                                        onChange={(e) => setDistHigherSecondary(e.target.value)}
                                        placeholder="e.g. 6.5"
                                    />
                                </div>
                                {applicationType === "New Recognition" && distPrimary && parseFloat(distPrimary) < 1 && (
                                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
                                        <div className="text-red-600 mt-0.5 font-bold">⚠️</div>
                                        <p className="text-[10px] text-red-700 leading-tight">
                                            <span className="font-bold">Distance Rule Flag:</span> The distance to the nearest Govt. Primary School is less than the RTE mandated 1.0 km radius. This application may face extra scrutiny.
                                        </p>
                                    </div>
                                )}
                                <p className="text-[10px] text-neutral-400 italic">
                                    *Distance is defined as walking distance after discounting for all natural and man-made barriers on the way to the school like highways, train lines etc.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <SelectField
                                    label="1.30 Whether School is Approachable by All-Weather Roads?"
                                    value={isAllWeatherRoad}
                                    onChange={(e) => setIsAllWeatherRoad(e.target.value)}
                                    options={["1-Yes", "2-No"]}
                                />
                                {isAllWeatherRoad === "2-No" && (
                                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl animate-in fade-in slide-in-from-top-1">
                                        <p className="text-[10px] text-amber-800 font-medium">
                                            <span className="font-bold">Safety Requirement:</span> Lack of all-weather road access requires a "Safety Access Plan" document upload and transport explanation.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <InputField
                                    label="1.31 Number of instructional days (in previous academic year):"
                                    value={instructionalDays}
                                    onChange={(e) => setInstructionalDays(e.target.value)}
                                    type="number"
                                    placeholder="e.g. 220"
                                />
                                {applicationType !== "New Recognition" && instructionalDays && (
                                    (schoolCategory.toLowerCase().includes("primary") && parseInt(instructionalDays) < 200) ||
                                    (schoolCategory.toLowerCase().includes("upper primary") && parseInt(instructionalDays) < 220)
                                ) && (
                                        <p className="text-[10px] text-red-600 font-bold italic">
                                            Note: RTE mandates minimum 200 days (Primary) or 220 days (Upper Primary). Please justify the shortfall.
                                        </p>
                                    )}
                            </div>

                            <div className="space-y-4 pt-6 mt-4 border-t border-dotted border-neutral-200">
                                <SelectField
                                    label="1.32 Is Continuous and Comprehensive Evaluation (CCE) being implemented in School?"
                                    value={isCCE}
                                    onChange={(e) => {
                                        setIsCCE(e.target.value);
                                        if (e.target.value === "2-No") {
                                            setIsRecordsMaintained("");
                                            setIsRecordsShared("");
                                        }
                                    }}
                                    options={["1-Yes", "2-No"]}
                                />
                                {isCCE === "2-No" && (
                                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl animate-in fade-in slide-in-from-top-1">
                                        <p className="text-[10px] text-amber-800 font-medium">
                                            <span className="font-bold">Important:</span> CCE is mandatory for recognition under the RTE Act. State/Central boards require its implementation.
                                        </p>
                                    </div>
                                )}

                                {isCCE === "1-Yes" && (
                                    <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 animate-in fade-in slide-in-from-top-2 duration-300 space-y-4 ml-0 md:ml-4 relative">
                                        <div className="absolute -left-4 top-6 w-4 h-px bg-primary-200 hidden md:block"></div>
                                        <div className="absolute -left-4 -top-6 bottom-0 w-px bg-primary-200 hidden md:block"></div>

                                        <h4 className="text-xs font-semibold text-primary-800 mb-2">If CCE being implemented then,</h4>
                                        <div className="space-y-4">
                                            <SelectField
                                                label="(a) Are cumulative records of pupil being maintained?"
                                                value={isRecordsMaintained}
                                                onChange={(e) => {
                                                    setIsRecordsMaintained(e.target.value);
                                                    if (e.target.value === "2-No") {
                                                        setIsRecordsShared("");
                                                    }
                                                }}
                                                options={["1-Yes", "2-No"]}
                                            />
                                            {applicationType === "Upgradation" && isRecordsMaintained === "1-Yes" && (
                                                <div className="mt-2 p-3 bg-white rounded-xl border border-primary-100">
                                                    <UploadField label="Upload Sample Cumulative Record / Progress Report (Mandatory for Upgradation)" />
                                                </div>
                                            )}
                                        </div>

                                        {isRecordsMaintained === "1-Yes" && (
                                            <div className="space-y-2">
                                                <SelectField
                                                    label="If yes, are cumulative records of pupil being shared with parents?"
                                                    value={isRecordsShared}
                                                    onChange={(e) => setIsRecordsShared(e.target.value)}
                                                    options={["1-Yes", "2-No"]}
                                                />
                                                {(applicationType === "Renewal" || applicationType === "Upgradation") && isRecordsShared === "2-No" && (
                                                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
                                                        <div className="text-red-600 mt-0.5 font-bold">⚠️</div>
                                                        <p className="text-[10px] text-red-700 leading-tight">
                                                            <span className="font-bold">Correction Required:</span> Dissemination of records to parents is a key compliance condition for CCE under Renewal or Upgradation.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sections 1.40 to 1.44 (Hidden for Private Unaided) */}
                        {managementGroup !== "C- Private Unaided" && (
                            <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-6">
                                <h3 className="text-lg font-semibold text-neutral-800 pb-2 border-b border-neutral-100">
                                    1.33 to 1.37 Anganwadi, Balavatika & Special Training
                                </h3>

                                <div className="space-y-4">
                                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                                        <SelectField
                                            label="1.33 Whether Anganwadi Centre(s) is/are located inside the school premises?"
                                            value={hasAnganwadi}
                                            onChange={(e) => {
                                                setHasAnganwadi(e.target.value);
                                                if (e.target.value === "2-No") {
                                                    setAnganwadiCentersCount("");
                                                    setAnganwadiRows(Array(3).fill(null).map(() => ({ code: "", name: "", boys: "", girls: "" })));
                                                }
                                            }}
                                            options={["1-Yes", "2-No"]}
                                        />
                                    </div>

                                    {hasAnganwadi === "1-Yes" && (
                                        <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 animate-in fade-in slide-in-from-top-2 duration-300 space-y-4 ml-0 md:ml-4 relative">
                                            <div className="absolute -left-4 top-6 w-4 h-px bg-primary-200 hidden md:block"></div>
                                            <div className="absolute -left-4 -top-6 bottom-0 w-px bg-primary-200 hidden md:block"></div>

                                            <InputField
                                                label="(a) Number of co-located Anganwadi Centre(s)"
                                                value={anganwadiCentersCount}
                                                onChange={(e) => setAnganwadiCentersCount(e.target.value)}
                                                type="number"
                                                placeholder="e.g. 1"
                                            />

                                            <div className="space-y-2">
                                                <p className="text-sm font-semibold text-neutral-700">(b) Details of Anganwadi Center(s) co-located:</p>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full border-collapse border border-neutral-200 text-sm">
                                                        <thead>
                                                            <tr className="bg-neutral-100 text-neutral-700">
                                                                <th className="border border-neutral-200 p-2 text-center w-12" rowSpan={2}>Sl. No.</th>
                                                                <th className="border border-neutral-200 p-2 text-left" rowSpan={2}>Code of the Anganwadi Centre(s)</th>
                                                                <th className="border border-neutral-200 p-2 text-left" rowSpan={2}>Name of Anganwadi Centre(s)</th>
                                                                <th className="border border-neutral-200 p-2 text-center" colSpan={2}>Children in Anganwadi Centre(s)</th>
                                                            </tr>
                                                            <tr className="bg-neutral-100 text-neutral-700">
                                                                <th className="border border-neutral-200 p-2 text-center w-24">Boys</th>
                                                                <th className="border border-neutral-200 p-2 text-center w-24">Girls</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {anganwadiRows.map((row, idx) => (
                                                                <tr key={idx} className="bg-white">
                                                                    <td className="border border-neutral-200 p-2 text-center text-neutral-500">({['i', 'ii', 'iii'][idx]})</td>
                                                                    <td className="border border-neutral-200 p-1">
                                                                        <input
                                                                            type="text"
                                                                            value={row.code}
                                                                            onChange={(e) => {
                                                                                const newRows = [...anganwadiRows];
                                                                                newRows[idx].code = e.target.value;
                                                                                setAnganwadiRows(newRows);
                                                                            }}
                                                                            className="w-full bg-transparent focus:outline-none p-1"
                                                                            placeholder="Code"
                                                                        />
                                                                    </td>
                                                                    <td className="border border-neutral-200 p-1">
                                                                        <input
                                                                            type="text"
                                                                            value={row.name}
                                                                            onChange={(e) => {
                                                                                const newRows = [...anganwadiRows];
                                                                                newRows[idx].name = e.target.value;
                                                                                setAnganwadiRows(newRows);
                                                                            }}
                                                                            className="w-full bg-transparent focus:outline-none p-1"
                                                                            placeholder="Name"
                                                                        />
                                                                    </td>
                                                                    <td className="border border-neutral-200 p-1">
                                                                        <input
                                                                            type="number"
                                                                            value={row.boys}
                                                                            onChange={(e) => {
                                                                                const newRows = [...anganwadiRows];
                                                                                newRows[idx].boys = e.target.value;
                                                                                setAnganwadiRows(newRows);
                                                                            }}
                                                                            className="w-full bg-transparent focus:outline-none p-1 text-center"
                                                                            placeholder="0"
                                                                        />
                                                                    </td>
                                                                    <td className="border border-neutral-200 p-1">
                                                                        <input
                                                                            type="number"
                                                                            value={row.girls}
                                                                            onChange={(e) => {
                                                                                const newRows = [...anganwadiRows];
                                                                                newRows[idx].girls = e.target.value;
                                                                                setAnganwadiRows(newRows);
                                                                            }}
                                                                            className="w-full bg-transparent focus:outline-none p-1 text-center"
                                                                            placeholder="0"
                                                                        />
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <SelectField
                                        label="1.34 Whether Balavatika is started in the Co-located Anganwadi/school?"
                                        value={hasBalavatika}
                                        onChange={(e) => setHasBalavatika(e.target.value)}
                                        options={["1-Yes", "2-No"]}
                                    />

                                    <div className="pt-4 border-t border-dotted border-neutral-200 space-y-4">
                                        <SelectField
                                            label="1.35 Whether any Out of School Children enrolled in the school?"
                                            value={hasOoSC}
                                            onChange={(e) => {
                                                setHasOoSC(e.target.value);
                                                if (e.target.value === "2-No") setHasOoSCST("");
                                            }}
                                            options={["1-Yes", "2-No"]}
                                        />

                                        {hasOoSC === "1-Yes" && (
                                            <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 ml-0 md:ml-4 relative">
                                                <div className="absolute -left-4 top-6 w-4 h-px bg-primary-200 hidden md:block"></div>
                                                <div className="absolute -left-4 -top-6 bottom-0 w-px bg-primary-200 hidden md:block"></div>
                                                <SelectField
                                                    label="If 1-Yes, (a) whether enrolled Out of School Children attending Special training in school or not?"
                                                    value={hasOoSCST}
                                                    onChange={(e) => setHasOoSCST(e.target.value)}
                                                    options={["1-Yes", "2-No"]}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-dotted border-neutral-200 space-y-4">
                                        <InputField
                                            label="1.36 Number of students attending Remedial Teaching/Extra Classes in current year:"
                                            value={remedialStudents}
                                            onChange={(e) => setRemedialStudents(e.target.value)}
                                            type="number"
                                            placeholder="e.g. 15"
                                        />
                                        <InputField
                                            label="1.37 Number of students attending Learning Enhancement classes:"
                                            value={learningEnhancementStudents}
                                            onChange={(e) => setLearningEnhancementStudents(e.target.value)}
                                            type="number"
                                            placeholder="e.g. 20"
                                        />
                                        {applicationType === "Upgradation" && (remedialStudents === "0" || !remedialStudents) && (
                                            <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
                                                <div className="text-red-600 mt-0.5 font-bold">⚠️</div>
                                                <p className="text-[10px] text-red-700 leading-tight">
                                                    <span className="font-bold">Required for Upgradation:</span> You must prove academic support systems (like remedial classes) are in place to ensure students don't drop out in new grades.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Section 1.45 to 1.47 Inspections & Committees */}
                        <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-8">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-neutral-800 pb-2 border-b border-neutral-100">
                                    1.38 Details of visits to the school during the previous academic year:
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <InputField
                                        label="(a) Number of Academic inspections:"
                                        value={academicInspections}
                                        onChange={(e) => setAcademicInspections(e.target.value)}
                                        type="number"
                                    />
                                    <InputField
                                        label="(b) Number of visits by CRC Coordinator/CRP:"
                                        value={crcVisits}
                                        onChange={(e) => setCrcVisits(e.target.value)}
                                        type="number"
                                    />
                                    <InputField
                                        label="(c) Number of visits by Block level officer (BRC/BEO):"
                                        value={brcVisits}
                                        onChange={(e) => setBrcVisits(e.target.value)}
                                        type="number"
                                    />
                                    <InputField
                                        label="(d) Number of visits by District/State level officers:"
                                        value={districtVisits}
                                        onChange={(e) => setDistrictVisits(e.target.value)}
                                        type="number"
                                    />
                                </div>
                                {applicationType !== "New Recognition" && academicInspections === "0" && (
                                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-2">
                                        <div className="text-amber-600 mt-0.5 font-bold">⚠️</div>
                                        <p className="text-[10px] text-amber-800 leading-tight">
                                            <span className="font-bold">Audit Warning:</span> Zero academic inspections reported. A fresh inspection is highly recommended or may be mandated before processing this {applicationType.toLowerCase()}.
                                        </p>
                                    </div>
                                )}

                                {(managementCode.includes("101") || managementGroup.startsWith("D")) && (
                                    <div className="mt-4 p-4 bg-primary-50 rounded-xl border border-primary-100">
                                        <p className="text-xs font-semibold text-primary-800 mb-3 italic">For JNV/KV/Other Central Government Schools</p>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <InputField
                                                label="(e) No. of visits by Regional Level Officer"
                                                value={regionalVisits}
                                                onChange={(e) => setRegionalVisits(e.target.value)}
                                                type="number"
                                            />
                                            <InputField
                                                label="(f) No. of visits by Headquarter Level Officer"
                                                value={hqVisits}
                                                onChange={(e) => setHqVisits(e.target.value)}
                                                type="number"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4 pt-6 border-t border-neutral-100">
                                <h3 className="text-lg font-semibold text-neutral-800 pb-2 border-b border-neutral-100">
                                    1.39 School Management Committee (SMC/SDMC)
                                </h3>
                                <div className="grid md:grid-cols-2 gap-5">
                                    <div className="space-y-4 border-r border-neutral-100 pr-4">
                                        <SelectField
                                            label="(a) Whether School Management Committee (SMC) has been constituted as per RTE norms?"
                                            value={hasSMC}
                                            onChange={(e) => setHasSMC(e.target.value)}
                                            options={["1-Yes", "2-No"]}
                                        />
                                        {applicationType === "New Recognition" && hasSMC === "2-No" && (
                                            <p className="text-[10px] text-red-600 font-bold">
                                                Must be 'Yes' to proceed with New Recognition.
                                            </p>
                                        )}
                                        {applicationType === "New Recognition" && hasSMC === "1-Yes" && (
                                            <div className="mt-2 p-3 bg-white rounded-xl border border-primary-100">
                                                <UploadField label="Upload List of SMC/SDMC Members (Mandatory)" />
                                            </div>
                                        )}
                                        <SelectField
                                            label="(b) Whether School Development and Management Committee have been Constituted as per Samagra Shiksha guidelines?"
                                            value={hasSDMC}
                                            onChange={(e) => setHasSDMC(e.target.value)}
                                            options={["1-Yes", "2-No", "3-Same as SMC"]}
                                        />
                                    </div>

                                    {(hasSMC === "1-Yes" || hasSDMC === "1-Yes" || hasSDMC === "3-Same as SMC") && (
                                        <div className="space-y-4 bg-primary-50 p-4 rounded-xl border border-primary-100">
                                            <p className="text-xs font-semibold text-primary-800 mb-2">If (a) or/and (b) is 1-Yes,</p>
                                            <InputField
                                                label="(c) Number of SMC/SDMC Meetings Conducted in previous Academic year:"
                                                value={smcMeetings}
                                                onChange={(e) => setSmcMeetings(e.target.value)}
                                                type="number"
                                                placeholder="e.g. 4"
                                            />
                                            <SelectField
                                                label="(d) Whether SMC/SDMC has prepared the School Development Plan?"
                                                value={hasSMCPlan}
                                                onChange={(e) => {
                                                    setHasSMCPlan(e.target.value);
                                                    if (e.target.value === "2-No") setSmcPlanYear("");
                                                }}
                                                options={["1-Yes", "2-No"]}
                                            />
                                            {hasSMCPlan === "1-Yes" && (
                                                <>
                                                    <InputField
                                                        label="If 1-Yes, mention the year"
                                                        value={smcPlanYear}
                                                        onChange={(e) => setSmcPlanYear(e.target.value)}
                                                        placeholder="YYYY"
                                                    />
                                                    {applicationType === "Upgradation" && (
                                                        <div className="mt-2 p-3 bg-white rounded-xl border border-primary-100">
                                                            <UploadField label="Upload School Development Plan Document (Mandatory for Upgradation)" />
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-neutral-100">
                                <h3 className="text-lg font-semibold text-neutral-800 pb-2 border-b border-neutral-100">
                                    1.40 Other Committees
                                </h3>
                                <div className="grid md:grid-cols-2 gap-5">
                                    <SelectField
                                        label="(a) Whether the School Building Committee (SBC) has been constituted?"
                                        value={hasSBC}
                                        onChange={(e) => setHasSBC(e.target.value)}
                                        options={["1-Yes", "2-No"]}
                                    />
                                    <SelectField
                                        label="(b) Whether the School has constituted its Academic Committee (AC)?"
                                        value={hasAC}
                                        onChange={(e) => setHasAC(e.target.value)}
                                        options={["1-Yes", "2-No"]}
                                    />
                                    {applicationType === "Upgradation" && hasAC !== "1-Yes" && (
                                        <p className="text-[10px] text-amber-600 font-bold italic md:-mt-4 md:col-start-2">
                                            Strongly recommended for Upgradation to manage curriculum complexity.
                                        </p>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-dotted border-neutral-200">
                                    <SelectField
                                        label="(c) Whether the School has constituted its Parent-Teacher Association (PTA)?"
                                        value={hasPTA}
                                        onChange={(e) => {
                                            setHasPTA(e.target.value);
                                            if (e.target.value === "2-No") setPtaMeetings("");
                                        }}
                                        options={["1-Yes", "2-No"]}
                                    />
                                    {hasPTA === "1-Yes" && (
                                        <div className="mt-4 md:w-1/2 p-4 bg-primary-50 rounded-xl border border-primary-100">
                                            <InputField
                                                label="If 1-Yes, Number of PTA meetings held during the last academic year"
                                                value={ptaMeetings}
                                                onChange={(e) => setPtaMeetings(e.target.value)}
                                                type="number"
                                                placeholder="e.g. 3"
                                            />
                                            {ptaMeetings && parseInt(ptaMeetings) < 3 && applicationType !== "New Recognition" && (
                                                <p className="text-[10px] text-red-600 font-medium mt-1">
                                                    Note: State governments often require 3-4 PTA meetings/year for renewal good standing.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section 1.48 to 1.55 (New Requirements) */}
                        <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-8">

                            {/* 1.48 PFMS */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-neutral-800 pb-2 border-b border-neutral-100">
                                    1.41 Public Financial Management System (PFMS)
                                </h3>
                                <div className="grid md:grid-cols-2 gap-5">
                                    <SelectField
                                        label="Is the school registered under PFMS?"
                                        value={hasPFMS}
                                        onChange={(e) => {
                                            setHasPFMS(e.target.value);
                                            if (e.target.value === "2-No") setPfmsId("");
                                        }}
                                        options={["1-Yes", "2-No"]}
                                    />
                                    {hasPFMS === "1-Yes" && (
                                        <div className="animate-in fade-in slide-in-from-top-2">
                                            <InputField
                                                label="PFMS Unique Code"
                                                value={pfmsId}
                                                onChange={(e) => setPfmsId(e.target.value)}
                                                placeholder="Enter PFMS ID"
                                            />
                                        </div>
                                    )}
                                </div>
                                {(applicationType === "Renewal" || applicationType === "Upgradation") && managementGroup !== "C- Private Unaided" && hasPFMS === "2-No" && (
                                    <p className="text-[10px] text-amber-600 font-bold italic mt-1">
                                        Note: PFMS registration is strongly recommended or mandatory for aided schools receiving government grants.
                                    </p>
                                )}
                            </div>

                            {/* 1.49 Multi-Class Units */}
                            <div className="space-y-4 pt-6 border-t border-neutral-100">
                                <h3 className="text-lg font-semibold text-neutral-800 pb-2 border-b border-neutral-100">
                                    1.42 Multi-Class Units
                                </h3>
                                <SelectField
                                    label="Whether the school has multi-class units?"
                                    value={hasMultiClass}
                                    onChange={(e) => {
                                        setHasMultiClass(e.target.value);
                                        if (e.target.value === "2-No") {
                                            setMultiClassRows(Array(3).fill(null).map(() => ({ classes: "" })));
                                        }
                                    }}
                                    options={["1-Yes", "2-No"]}
                                />
                                {hasMultiClass === "1-Yes" && (
                                    <div className="space-y-4 bg-primary-50 p-4 rounded-xl border border-primary-100 animate-in fade-in slide-in-from-top-2">
                                        <p className="text-sm font-semibold text-neutral-700">If 1-Yes, classes taught together in a single classroom:</p>
                                        <p className="text-[10px] text-neutral-500 italic">[Use ',' (comma) in between classes. For Example 1,2,3,4]</p>

                                        <div className="overflow-x-auto">
                                            <table className="w-full max-w-md border-collapse border border-neutral-200 text-sm">
                                                <thead>
                                                    <tr className="bg-neutral-100 text-neutral-700">
                                                        <th className="border border-neutral-200 p-2 text-center w-16">Sl No</th>
                                                        <th className="border border-neutral-200 p-2 text-left">Classes Taught Together</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {multiClassRows.map((row, idx) => (
                                                        <tr key={idx} className="bg-white">
                                                            <td className="border border-neutral-200 p-2 text-center text-neutral-500">{idx + 1}</td>
                                                            <td className="border border-neutral-200 p-1">
                                                                <input
                                                                    type="text"
                                                                    value={row.classes}
                                                                    onChange={(e) => {
                                                                        const newRows = [...multiClassRows];
                                                                        newRows[idx].classes = e.target.value;
                                                                        setMultiClassRows(newRows);
                                                                    }}
                                                                    className="w-full bg-transparent focus:outline-none p-1"
                                                                    placeholder="e.g. 1, 2"
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                                {hasMultiClass === "1-Yes" && applicationType === "New Recognition" && (
                                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-2">
                                        <div className="text-amber-600 mt-0.5 font-bold">⚠️</div>
                                        <p className="text-[10px] text-amber-800 leading-tight">
                                            <span className="font-bold">Infrastructure Gap:</span> Having multi-class units in a new school may indicate a deficiency in classrooms or teachers. Prepare a justification plan.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* 1.43 & 1.44 School Complex & Hub */}
                            <div className="space-y-4 pt-6 border-t border-neutral-100">
                                <h3 className="text-lg font-semibold text-neutral-800 pb-2 border-b border-neutral-100">
                                    1.43 & 1.44 School Complex
                                </h3>
                                <div className="grid md:grid-cols-2 gap-5">
                                    <SelectField
                                        label="1.43 Is the school part of a School Complex?"
                                        value={isSchoolComplex}
                                        onChange={(e) => setIsSchoolComplex(e.target.value)}
                                        options={["1-Yes", "2-No"]}
                                    />
                                    <SelectField
                                        label="1.44 Is the school a Hub School for the school complex?"
                                        value={isHubSchool}
                                        onChange={(e) => setIsHubSchool(e.target.value)}
                                        options={["1-Yes", "2-No"]}
                                    />
                                </div>
                                {isHubSchool === "1-Yes" && (
                                    <div className="space-y-4 bg-primary-50 p-4 rounded-xl border border-primary-100 animate-in fade-in slide-in-from-top-2">
                                        <p className="text-sm font-semibold text-neutral-700">If 1-Yes, Number of schools in the school complex:</p>
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse border border-neutral-200 text-[11px] md:text-xs">
                                                <thead>
                                                    <tr className="bg-neutral-100 text-neutral-700">
                                                        <th className="border border-neutral-200 p-2 text-center">Pre Primary</th>
                                                        <th className="border border-neutral-200 p-2 text-center">Primary</th>
                                                        <th className="border border-neutral-200 p-2 text-center">Upper Primary</th>
                                                        <th className="border border-neutral-200 p-2 text-center">Secondary</th>
                                                        <th className="border border-neutral-200 p-2 text-center">Higher Secondary</th>
                                                        <th className="border border-neutral-200 p-2 text-center">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="bg-white">
                                                        <td className="border border-neutral-200 p-1"><input type="number" value={complexPrePrimary} onChange={(e) => setComplexPrePrimary(e.target.value)} className="w-full text-center focus:outline-none" placeholder="0" /></td>
                                                        <td className="border border-neutral-200 p-1"><input type="number" value={complexPrimary} onChange={(e) => setComplexPrimary(e.target.value)} className="w-full text-center focus:outline-none" placeholder="0" /></td>
                                                        <td className="border border-neutral-200 p-1"><input type="number" value={complexUpperPrimary} onChange={(e) => setComplexUpperPrimary(e.target.value)} className="w-full text-center focus:outline-none" placeholder="0" /></td>
                                                        <td className="border border-neutral-200 p-1"><input type="number" value={complexSecondary} onChange={(e) => setComplexSecondary(e.target.value)} className="w-full text-center focus:outline-none" placeholder="0" /></td>
                                                        <td className="border border-neutral-200 p-1"><input type="number" value={complexHigherSecondary} onChange={(e) => setComplexHigherSecondary(e.target.value)} className="w-full text-center focus:outline-none" placeholder="0" /></td>
                                                        <td className="border border-neutral-200 p-1"><input type="number" value={complexTotal} onChange={(e) => setComplexTotal(e.target.value)} className="w-full text-center focus:outline-none font-bold" placeholder="0" /></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 1.52 to 1.54 National Programs */}
                            <div className="space-y-4 pt-6 border-t border-neutral-100">
                                <h3 className="text-lg font-semibold text-neutral-800 pb-2 border-b border-neutral-100">
                                    1.45 to 1.47 National Programs
                                </h3>
                                <div className="space-y-5">
                                    <SelectField
                                        label="1.45 Whether the school has undertaken any activity under “Ek Bharat Shreshtha Bharat” (EBSB)?"
                                        value={hasEBSB}
                                        onChange={(e) => setHasEBSB(e.target.value)}
                                        options={["1-Yes", "2-No"]}
                                    />

                                    <div className="space-y-3">
                                        <SelectField
                                            label="1.46 Is the School certified as Fit India School?"
                                            value={hasFitIndia}
                                            onChange={(e) => setHasFitIndia(e.target.value)}
                                            options={["1-Yes", "2-No"]}
                                        />
                                        {hasFitIndia === "1-Yes" && (
                                            <div className="ml-0 md:ml-4 p-3 bg-white rounded-xl border border-primary-100 animate-in fade-in slide-in-from-top-2">
                                                <UploadField label="Upload Fit India Certificate (Optional but recommended)" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <SelectField
                                            label="1.47 Is the school providing Holistic Report Card for every Learner based on peer/self/teacher assessment?"
                                            value={hasHolisticReportCard}
                                            onChange={(e) => setHasHolisticReportCard(e.target.value)}
                                            options={["1-Yes", "2-No"]}
                                        />
                                        {hasHolisticReportCard === "1-Yes" && applicationType === "New Recognition" && (
                                            <p className="text-[10px] text-emerald-600 font-bold italic">
                                                Excellent: This serves as a strong Policy Compliance declaration aligning with NEP.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* 1.48 PM-POSHAN (Mid-day Meal) */}
                            {managementGroup !== "C- Private Unaided" && applicationType !== "New Recognition" && (
                                <div className="space-y-4 pt-6 border-t border-neutral-100">
                                    <h3 className="text-lg font-semibold text-neutral-800 pb-2 border-b border-neutral-100">
                                        1.48 PM-POSHAN (Mid-day Meal)
                                    </h3>
                                    <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 space-y-5">
                                        <p className="text-sm font-semibold text-neutral-700">
                                            (a) Number of days Mid-day Meal served under PM-POSHAN (As Per PREVIOUS academic year)
                                        </p>
                                        <div className="grid md:grid-cols-3 gap-4">
                                            <InputField
                                                label="(i) Total Days"
                                                value={pmPoshanTotalDays}
                                                onChange={(e) => setPmPoshanTotalDays(e.target.value)}
                                                type="number"
                                                placeholder="e.g. 220"
                                            />
                                            <InputField
                                                label="(ii) Days per Week"
                                                value={pmPoshanDaysPerWeek}
                                                onChange={(e) => setPmPoshanDaysPerWeek(e.target.value)}
                                                type="number"
                                                placeholder="e.g. 5"
                                            />
                                            <InputField
                                                label="(iii) Days per Month"
                                                value={pmPoshanDaysPerMonth}
                                                onChange={(e) => setPmPoshanDaysPerMonth(e.target.value)}
                                                type="number"
                                                placeholder="e.g. 22"
                                            />
                                        </div>
                                        {pmPoshanTotalDays && pmPoshanDaysPerWeek && pmPoshanDaysPerMonth && (
                                            Math.abs(parseInt(pmPoshanTotalDays) - (parseInt(pmPoshanDaysPerWeek) * parseInt(pmPoshanDaysPerMonth) * (10))) > 40 // simple sanity check (e.g. ~10 months a year)
                                        ) && (
                                                <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
                                                    <div className="text-red-600 mt-0.5 font-bold">⚠️</div>
                                                    <p className="text-[10px] text-red-700 leading-tight">
                                                        <span className="font-bold">Data Integrity Check:</span> The 'Total Days' seems inconsistent with the reported 'Days per Week' and 'Days per Month' relative to a typical 10-month school year. Please verify your entries.
                                                    </p>
                                                </div>
                                            )}

                                        <div className="pt-4 border-t border-primary-200">
                                            <SelectField
                                                label="(b) If Mid-day Meal Extended to Pre-Primary Section/Balvatika?"
                                                value={pmPoshanBalvatika}
                                                onChange={(e) => setPmPoshanBalvatika(e.target.value)}
                                                options={["1-Yes", "2-No"]}
                                            />
                                            {applicationType === "Upgradation" && pmPoshanBalvatika === "2-No" && (
                                                <p className="text-[10px] text-amber-600 font-bold italic mt-1">
                                                    Note: If applying to add Pre-Primary sections, extending the meal scheme is strongly encouraged.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Section 1.56: TLM & Textbooks */}
                            <div className="space-y-4 pt-6 border-t border-neutral-100">
                                <h3 className="text-lg font-semibold text-neutral-800 pb-2 border-b border-neutral-100">
                                    1.49 Availability of free text books, Teaching Learning Material (TLM), Play material & Graded Supplementary Material
                                </h3>
                                {applicationType === "New Recognition" ? (
                                    <div className="bg-primary-50 p-4 rounded-xl border border-primary-200 animate-in fade-in">
                                        <label className="flex items-start gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="mt-1 w-4 h-4 text-primary-600 rounded border-neutral-300 focus:ring-primary-500"
                                                checked={hasAgreedToFirstYearActivities}
                                                onChange={(e) => setHasAgreedToFirstYearActivities(e.target.checked)}
                                            />
                                            <span className="text-sm text-neutral-700">
                                                <span className="font-semibold block mb-1">Declaration for New Recognition</span>
                                                As a new applicant, we declare that upon recognition, the school will ensure the timely availability of free textbooks, teaching learning materials (TLM), graded supplementary materials, play materials, and uniforms (if applicable) for all relevant grades as per prevailing government guidelines.
                                            </span>
                                        </label>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse border border-neutral-200 text-[11px] md:text-xs">
                                            <thead>
                                                <tr className="bg-neutral-100 text-neutral-700">
                                                    <th className="border border-neutral-200 p-2 text-center w-12">Sl. No.</th>
                                                    <th className="border border-neutral-200 p-2 text-left w-64">Indicators</th>
                                                    <th className="border border-neutral-200 p-2 text-center">Pre-Primary</th>
                                                    <th className="border border-neutral-200 p-2 text-center">Primary</th>
                                                    <th className="border border-neutral-200 p-2 text-center">Upper Primary</th>
                                                    <th className="border border-neutral-200 p-2 text-center">Secondary</th>
                                                    <th className="border border-neutral-200 p-2 text-center">Higher Secondary</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[
                                                    { id: "1.56.1", label: "Whether complete set of free textbooks received?", type: "select" },
                                                    { id: "1.56.1.1", label: "When were the textbooks received in the current academic year? (e.g. 05-May)", type: "text" },
                                                    { id: "1.56.2", label: "Whether TLM available for each grade?", type: "select" },
                                                    { id: "1.56.3", label: "Whether the school has received Graded Supplementary Material in previous academic year?", type: "select" },
                                                    { id: "1.56.3.1", label: "If Yes, whether the school utilize graded supplementary material in classroom transactions", type: "select" },
                                                    { id: "1.56.4", label: "Whether play material, games and sports equipment available for each grade?", type: "select" },
                                                    { id: "1.56.5", label: "Whether the school has provided free uniform to the students?", type: "select" },
                                                    { id: "1.56.5.1", label: "If Yes, Mention the month in which the uniforms were provided to students in the current academic year (e.g. 05-May)", type: "text" },
                                                ].map((row, idx) => (
                                                    <tr key={idx} className="bg-white hover:bg-neutral-50">
                                                        <td className="border border-neutral-200 p-2 text-center font-medium text-neutral-600">{row.id}</td>
                                                        <td className="border border-neutral-200 p-2 text-neutral-700">{row.label}</td>
                                                        {['prePrimary', 'primary', 'upperPrimary', 'secondary', 'higherSecondary'].map((col) => (
                                                            <td key={col} className="border border-neutral-200 p-1 min-w-20">
                                                                {row.type === "select" ? (
                                                                    <select
                                                                        className="w-full bg-transparent focus:outline-none p-1 text-center"
                                                                        value={sec156[idx][col as keyof Sec156Row]}
                                                                        onChange={(e) => {
                                                                            const newSec = [...sec156];
                                                                            newSec[idx][col as keyof Sec156Row] = e.target.value;
                                                                            setSec156(newSec);
                                                                        }}
                                                                    >
                                                                        <option value="">-</option>
                                                                        <option value="1-YES">1-YES</option>
                                                                        <option value="2-NO">2-NO</option>
                                                                    </select>
                                                                ) : (
                                                                    <input
                                                                        type="text"
                                                                        className="w-full bg-transparent focus:outline-none p-1 text-center"
                                                                        value={sec156[idx][col as keyof Sec156Row]}
                                                                        onChange={(e) => {
                                                                            const newSec = [...sec156];
                                                                            newSec[idx][col as keyof Sec156Row] = e.target.value;
                                                                            setSec156(newSec);
                                                                        }}
                                                                        placeholder="-"
                                                                    />
                                                                )}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Section 1.57: KPIs */}
                            <div className="space-y-4 pt-6 border-t border-neutral-100">
                                <h3 className="text-lg font-semibold text-neutral-800 pb-2 border-b border-neutral-100">
                                    1.50 Key Performing Indicators (KPI) on teaching, learning (in previous academic year), materials etc.
                                </h3>
                                {applicationType === "New Recognition" ? (
                                    <div className="bg-primary-50 p-4 rounded-xl border border-primary-200 animate-in fade-in">
                                        <p className="text-sm text-neutral-700">
                                            <span className="font-semibold block mb-1">Not Applicable for New Recognition</span>
                                            As a new applicant with no previous academic year data, KPIs on teaching and learning will be evaluated during your first operational cycle and subsequent renewals. Focus on your first-year declarations.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4 animate-in fade-in">
                                        {applicationType === "Upgradation" && (
                                            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2">
                                                <div className="text-blue-600 mt-0.5 font-bold">ℹ️</div>
                                                <p className="text-[10px] text-blue-800 leading-tight">
                                                    <span className="font-bold">Upgradation Note:</span> High numbers in Learning Outcomes Assessment (1.57.1) and Cyber Safety Orientation (1.57.3) are crucial indicators of readiness for secondary/higher secondary responsibilities.
                                                </p>
                                            </div>
                                        )}
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse border border-neutral-200 text-[11px] md:text-xs">
                                                <thead>
                                                    <tr className="bg-neutral-100 text-neutral-700">
                                                        <th className="border border-neutral-200 p-2 text-center w-8">KPI</th>
                                                        <th className="border border-neutral-200 p-2 text-left w-56">Indicator Name</th>
                                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(cls => (
                                                            <th key={cls} className="border border-neutral-200 p-1 text-center min-w-10 text-[10px] md:text-xs">Cl {cls}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {[
                                                        { id: "1.57.1", label: "Number of learning outcome based assessment items created in total", field: "assessment" as const, type: "number" },
                                                        { id: "1.57.2", label: "Whether the school actively undertakes academic enrichment activities (Project, portfolio, etc)? (1-YES / 2-NO)", field: "enrichment" as const, type: "select" },
                                                        { id: "1.57.3", label: "Number of students received orientation on cyber safety", field: "cyber" as const, type: "number" },
                                                        { id: "1.57.4", label: "Number of students received training on psycho-social aspects", field: "psycho" as const, type: "number" },
                                                    ].map((row, rowIdx) => (
                                                        <tr key={rowIdx} className="bg-white hover:bg-neutral-50">
                                                            <td className="border border-neutral-200 p-2 text-center font-medium text-neutral-600">{row.id}</td>
                                                            <td className="border border-neutral-200 p-2 text-neutral-700">{row.label}</td>
                                                            {Array.from({ length: 12 }, (_, i) => i).map((colIdx) => {
                                                                const isClass1to5 = colIdx < 5;
                                                                const isDisabled = row.id === "1.57.1" && isClass1to5;

                                                                return (
                                                                    <td key={colIdx} className={`border border-neutral-200 p-0 ${isDisabled ? 'bg-neutral-200/50' : ''}`}>
                                                                        {isDisabled ? (
                                                                            <div className="w-full h-full flex items-center justify-center text-neutral-400 text-[10px]">N/A</div>
                                                                        ) : row.type === "select" ? (
                                                                            <select
                                                                                className="w-full bg-transparent focus:outline-none p-1 text-center text-[10px] md:text-[11px] cursor-pointer"
                                                                                value={sec157[colIdx][row.field]}
                                                                                onChange={(e) => {
                                                                                    const newSec = [...sec157];
                                                                                    newSec[colIdx][row.field] = e.target.value;
                                                                                    setSec157(newSec);
                                                                                }}
                                                                            >
                                                                                <option value="">-</option>
                                                                                <option value="1-YES">Y</option>
                                                                                <option value="2-NO">N</option>
                                                                            </select>
                                                                        ) : (
                                                                            <input
                                                                                type="number"
                                                                                className="w-full bg-transparent focus:outline-none p-1 text-center min-w-6 text-[10px] md:text-[11px]"
                                                                                value={sec157[colIdx][row.field]}
                                                                                onChange={(e) => {
                                                                                    const newSec = [...sec157];
                                                                                    newSec[colIdx][row.field] = e.target.value;
                                                                                    setSec157(newSec);
                                                                                }}
                                                                                placeholder="0"
                                                                            />
                                                                        )}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        {applicationType === "Renewal" && sec157.some(cls => cls.enrichment === "2-NO") && (
                                            <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                                                <div className="text-red-600 mt-0.5 font-bold">⚠️</div>
                                                <p className="text-[10px] text-red-700 leading-tight">
                                                    <span className="font-bold">Renewal Warning:</span> Enrichment activities (1.50.2) are marked as NO for one or more classes. This may trigger a requirement to improve your academic plan before renewal is approved as per the National Curriculum Framework.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 1: Receipts and Expenditure */}
                {currentStep === 1 && (
                    <div className="space-y-8">
                        {/* 2.1 Grants */}
                        {managementGroup !== "C- Private Unaided" && (
                            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
                                <h3 className="text-lg font-semibold text-neutral-800 pb-2 border-b border-neutral-100">
                                    2.1 Grants received by the school & expenditure made during the previous financial year
                                    <span className="block text-sm font-normal text-neutral-500 mt-1">(Only for Govt. and Govt. Aided Schools)</span>
                                </h3>

                                {applicationType === "New Recognition" ? (
                                    <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                                        <p className="text-sm text-neutral-600 italic">Not applicable for New Recognition applications. Grants data will be tracked in subsequent years.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse border border-neutral-200 text-sm">
                                            <thead>
                                                <tr className="bg-neutral-50 text-neutral-700">
                                                    <th className="border border-neutral-200 p-3 text-left">Grants under Samagra Shiksha</th>
                                                    <th className="border border-neutral-200 p-3 text-center w-40">Receipt (In Rs.)</th>
                                                    <th className="border border-neutral-200 p-3 text-center w-40">Expenditure (In Rs.)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {grants.map((grant, idx) => (
                                                    <tr key={idx} className="bg-white hover:bg-neutral-50">
                                                        <td className="border border-neutral-200 p-2 font-medium text-neutral-700">{grant.grantName}</td>
                                                        <td className="border border-neutral-200 p-1">
                                                            <input
                                                                type="number"
                                                                className="w-full bg-transparent p-1 focus:outline-none text-center"
                                                                value={grant.receipt}
                                                                onChange={(e) => {
                                                                    const newGrants = [...grants];
                                                                    newGrants[idx].receipt = e.target.value;
                                                                    setGrants(newGrants);
                                                                }}
                                                                placeholder="0"
                                                            />
                                                        </td>
                                                        <td className="border border-neutral-200 p-1">
                                                            <input
                                                                type="number"
                                                                className="w-full bg-transparent p-1 focus:outline-none text-center"
                                                                value={grant.expenditure}
                                                                onChange={(e) => {
                                                                    const newGrants = [...grants];
                                                                    newGrants[idx].expenditure = e.target.value;
                                                                    setGrants(newGrants);
                                                                }}
                                                                placeholder="0"
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 1.60 Assistance */}
                        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
                            <h3 className="text-lg font-semibold text-neutral-800 pb-2 border-b border-neutral-100">
                                1.60 Financial Assistance received by the school (in Previous Academic year)
                            </h3>

                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-neutral-200 text-sm">
                                    <thead>
                                        <tr className="bg-neutral-50 text-neutral-700">
                                            <th className="border border-neutral-200 p-3 text-left">From</th>
                                            <th className="border border-neutral-200 p-3 text-center w-40">Is Assistance Received? (1-Yes, 2-No)</th>
                                            <th className="border border-neutral-200 p-3 text-center w-48">Name</th>
                                            <th className="border border-neutral-200 p-3 text-center w-32">Amount (In Rs.)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {assistance.map((ast, idx) => (
                                            <tr key={idx} className="bg-white hover:bg-neutral-50">
                                                <td className="border border-neutral-200 p-2 font-medium text-neutral-700">
                                                    {ast.source}
                                                </td>
                                                <td className="border border-neutral-200 p-1">
                                                    <select
                                                        className="w-full bg-transparent p-1 focus:outline-none text-center cursor-pointer"
                                                        value={ast.isReceived}
                                                        onChange={(e) => {
                                                            const newAst = [...assistance];
                                                            newAst[idx].isReceived = e.target.value;
                                                            if (e.target.value !== "1-Yes") {
                                                                newAst[idx].name = "";
                                                                newAst[idx].amount = "";
                                                            }
                                                            setAssistance(newAst);
                                                        }}
                                                    >
                                                        <option value="">Select</option>
                                                        <option value="1-Yes">1-Yes</option>
                                                        <option value="2-No">2-No</option>
                                                    </select>
                                                </td>
                                                <td className="border border-neutral-200 p-1">
                                                    <input
                                                        type="text"
                                                        className="w-full bg-transparent p-1 focus:outline-none disabled:opacity-50"
                                                        value={ast.name}
                                                        disabled={ast.isReceived !== "1-Yes"}
                                                        onChange={(e) => {
                                                            const newAst = [...assistance];
                                                            newAst[idx].name = e.target.value;
                                                            setAssistance(newAst);
                                                        }}
                                                        placeholder={ast.isReceived === "1-Yes" ? (idx === 3 ? "Specify source" : "Enter Name") : "N/A"}
                                                    />
                                                </td>
                                                <td className="border border-neutral-200 p-1">
                                                    <input
                                                        type="number"
                                                        className="w-full bg-transparent p-1 focus:outline-none text-center disabled:opacity-50"
                                                        value={ast.amount}
                                                        disabled={ast.isReceived !== "1-Yes"}
                                                        onChange={(e) => {
                                                            const newAst = [...assistance];
                                                            newAst[idx].amount = e.target.value;
                                                            setAssistance(newAst);
                                                        }}
                                                        placeholder={ast.isReceived === "1-Yes" ? "0" : "-"}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {applicationType === "New Recognition" && (
                                <p className="text-[10px] text-primary-600 font-bold italic mt-2">
                                    Note: If a new school is being built using NGO or Community funding, declare it here to prove financial stability.
                                </p>
                            )}
                            {["Renewal", "Upgradation"].includes(applicationType) && assistance.some(a => a.isReceived === "1-Yes") && (
                                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2 mt-4">
                                    <div className="text-emerald-600 mt-0.5 font-bold">✓</div>
                                    <p className="text-[10px] text-emerald-800 leading-tight">
                                        <span className="font-bold">Audit Trail:</span> Financial assistance documentation proves the school has community support and diverse funding sources.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* 1.61 Inventory Registers */}
                        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
                            <h3 className="text-lg font-semibold text-neutral-800 pb-2 border-b border-neutral-100">
                                1.61 Whether School is maintaining for the following? (In Previous Academic Year)
                            </h3>
                            <div className="space-y-4">
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse border border-neutral-200 text-sm">
                                        <thead>
                                            <tr className="bg-neutral-50 text-neutral-700">
                                                <th className="border border-neutral-200 p-3 text-center w-24">Sl. No.</th>
                                                <th className="border border-neutral-200 p-3 text-left">Details</th>
                                                <th className="border border-neutral-200 p-3 text-center w-56">Availability (1-Yes, 2-No)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="bg-white hover:bg-neutral-50">
                                                <td className="border border-neutral-200 p-2 text-center text-neutral-500">1.61.1</td>
                                                <td className="border border-neutral-200 p-2 font-medium text-neutral-700">Inventory Register on ICT Items</td>
                                                <td className="border border-neutral-200 p-1">
                                                    <select
                                                        className="w-full bg-transparent p-1 focus:outline-none text-center cursor-pointer"
                                                        value={hasIctRegister}
                                                        onChange={(e) => setHasIctRegister(e.target.value)}
                                                    >
                                                        <option value="">Select</option>
                                                        <option value="1-Yes">1-Yes</option>
                                                        <option value="2-No">2-No</option>
                                                    </select>
                                                </td>
                                            </tr>
                                            <tr className="bg-white hover:bg-neutral-50">
                                                <td className="border border-neutral-200 p-2 text-center text-neutral-500">1.61.2</td>
                                                <td className="border border-neutral-200 p-2 font-medium text-neutral-700">Inventory Register on Sports Equipment</td>
                                                <td className="border border-neutral-200 p-1">
                                                    <select
                                                        className="w-full bg-transparent p-1 focus:outline-none text-center cursor-pointer"
                                                        value={hasSportsRegister}
                                                        onChange={(e) => setHasSportsRegister(e.target.value)}
                                                    >
                                                        <option value="">Select</option>
                                                        <option value="1-Yes">1-Yes</option>
                                                        <option value="2-No">2-No</option>
                                                    </select>
                                                </td>
                                            </tr>
                                            <tr className="bg-white hover:bg-neutral-50">
                                                <td className="border border-neutral-200 p-2 text-center text-neutral-500">1.61.3</td>
                                                <td className="border border-neutral-200 p-2 font-medium text-neutral-700">Inventory Register on Library Books</td>
                                                <td className="border border-neutral-200 p-1">
                                                    <select
                                                        className="w-full bg-transparent p-1 focus:outline-none text-center cursor-pointer"
                                                        value={hasLibraryRegister}
                                                        onChange={(e) => setHasLibraryRegister(e.target.value)}
                                                    >
                                                        <option value="">Select</option>
                                                        <option value="1-Yes">1-Yes</option>
                                                        <option value="2-No">2-No</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {applicationType === "New Recognition" && (hasIctRegister === "2-No" || hasSportsRegister === "2-No" || hasLibraryRegister === "2-No") && (
                                    <p className="text-xs font-bold text-red-600 bg-red-50 p-2 rounded border border-red-200 mt-2">
                                        ❌ Mandatory Declaration: A new school must confirm it has established these registers to track initial equipment purchases.
                                    </p>
                                )}
                                {applicationType === "Renewal" && (hasIctRegister === "2-No" || hasSportsRegister === "2-No" || hasLibraryRegister === "2-No") && (
                                    <p className="text-xs font-bold text-red-600 bg-red-50 p-2 rounded border border-red-200 mt-2">
                                        ❌ Compliance Gap: Inventory registers are mandatory for renewal.
                                    </p>
                                )}
                                {applicationType === "Upgradation" && (hasIctRegister === "2-No" || hasSportsRegister === "2-No") && (
                                    <p className="text-[10px] text-red-600 font-bold bg-red-50 p-2 rounded border border-red-200 mt-2">
                                        ❌ Upgradation Blocker: Must prove registers (ICT & Sports) are ready for advanced equipment required at higher grades.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* 1.62 Total Expenditure */}
                        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
                            <h3 className="text-lg font-semibold text-neutral-800 pb-2 border-b border-neutral-100">
                                1.62 Total annual expenditure of school on account of following (in Previous Academic year)
                            </h3>

                            {applicationType === "New Recognition" ? (
                                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                                    <p className="text-sm text-neutral-600 italic">Since a brand-new school has no "previous year" of operation, these fields are not applicable.</p>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse border border-neutral-200 text-sm">
                                            <thead>
                                                <tr className="bg-neutral-50 text-neutral-700">
                                                    <th className="border border-neutral-200 p-3 text-center w-24">Sl. No.</th>
                                                    <th className="border border-neutral-200 p-3 text-left">Details</th>
                                                    <th className="border border-neutral-200 p-3 text-center w-56">Expenditure (In Rs.)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="bg-white hover:bg-neutral-50">
                                                    <td className="border border-neutral-200 p-2 text-center text-neutral-500">1.62.1</td>
                                                    <td className="border border-neutral-200 p-2 font-medium text-neutral-700">Maintenance/ Housekeeping</td>
                                                    <td className="border border-neutral-200 p-1">
                                                        <input
                                                            type="number"
                                                            className="w-full bg-transparent p-1 focus:outline-none text-center"
                                                            value={expMaintenance}
                                                            onChange={(e) => setExpMaintenance(e.target.value)}
                                                            placeholder="0"
                                                        />
                                                    </td>
                                                </tr>
                                                <tr className="bg-white hover:bg-neutral-50">
                                                    <td className="border border-neutral-200 p-2 text-center text-neutral-500">1.62.2</td>
                                                    <td className="border border-neutral-200 p-2 font-medium text-neutral-700">
                                                        Teachers
                                                        {applicationType === "Renewal" && (
                                                            <span className="block text-[10px] text-blue-600 italic font-normal mt-0.5">Critical: Used to cross-verify with Staff module for salary compliance.</span>
                                                        )}
                                                    </td>
                                                    <td className="border border-neutral-200 p-1">
                                                        <input
                                                            type="number"
                                                            className="w-full bg-transparent p-1 focus:outline-none text-center"
                                                            value={expTeachers}
                                                            onChange={(e) => setExpTeachers(e.target.value)}
                                                            placeholder="0"
                                                        />
                                                    </td>
                                                </tr>
                                                <tr className="bg-white hover:bg-neutral-50">
                                                    <td className="border border-neutral-200 p-2 text-center text-neutral-500">1.62.3</td>
                                                    <td className="border border-neutral-200 p-2 font-medium text-neutral-700">
                                                        Construction Works
                                                        {applicationType === "Upgradation" && (
                                                            <span className="block text-[10px] text-blue-600 italic font-normal mt-0.5">High: Essential proof of investment for higher levels.</span>
                                                        )}
                                                    </td>
                                                    <td className="border border-neutral-200 p-1">
                                                        <input
                                                            type="number"
                                                            className="w-full bg-transparent p-1 focus:outline-none text-center"
                                                            value={expConstruction}
                                                            onChange={(e) => setExpConstruction(e.target.value)}
                                                            placeholder="0"
                                                        />
                                                    </td>
                                                </tr>
                                                <tr className="bg-white hover:bg-neutral-50">
                                                    <td className="border border-neutral-200 p-2 text-center text-neutral-500">1.62.4</td>
                                                    <td className="border border-neutral-200 p-2 font-medium text-neutral-700">Others</td>
                                                    <td className="border border-neutral-200 p-1">
                                                        <input
                                                            type="number"
                                                            className="w-full bg-transparent p-1 focus:outline-none text-center"
                                                            value={expOthers}
                                                            onChange={(e) => setExpOthers(e.target.value)}
                                                            placeholder="0"
                                                        />
                                                    </td>
                                                </tr>
                                                <tr className="bg-neutral-100 font-bold">
                                                    <td className="border border-neutral-200 p-2 text-center"></td>
                                                    <td className="border border-neutral-200 p-2 text-right">Total Expenditure Incurred</td>
                                                    <td className="border border-neutral-200 p-2 text-center text-primary-700">
                                                        {((parseFloat(expMaintenance || "0") + parseFloat(expTeachers || "0") + parseFloat(expConstruction || "0") + parseFloat(expOthers || "0")) || 0).toLocaleString('en-IN')}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 2: Legal Details */}
                {
                    currentStep === 2 && (
                        <div className="grid md:grid-cols-2 gap-5">
                            <InputField label="3.1 Organization Name" placeholder="Enter organization name" />
                            <SelectField label="3.2 Ownership Type" options={["Trust", "Society", "Company", "Individual", "Government"]} />
                            <SelectField label="3.3 Land Ownership" options={["Owned", "Leased", "Government Allotted"]} />
                            <div className="md:col-span-2"><UploadField label="3.4 Land Document" /></div>
                            <div className="md:col-span-2"><UploadField label="3.5 NOC Certificate" /></div>
                            <div className="md:col-span-2"><UploadField label="3.6 Building Approval" /></div>
                        </div>
                    )
                }

                {/* Step 3: Location */}
                {
                    currentStep === 3 && (
                        <div className="grid md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <InputField label="4.1 Address" placeholder="Full address" value={address} onChange={(e) => setAddress(e.target.value)} />
                            </div>
                            <SelectField
                                label="4.2 School Location Type"
                                options={["Rural", "Urban"]}
                                value={locationType}
                                onChange={(e) => setLocationType(e.target.value)}
                            />
                            <InputField label="4.3 Pin Code" placeholder="6-digit pin code" value={pinCode} onChange={(e) => setPinCode(e.target.value)} />

                            {locationType === "Rural" && (
                                <>
                                    <InputField label="4.4 Revenue Block / CD Block (As Per LGD)" placeholder="Enter Revenue Block" value={revenueBlock} onChange={(e) => setRevenueBlock(e.target.value)} />
                                    <InputField label="4.5 Village Name (As Per LGD)" placeholder="Enter Village Name" value={villageName} onChange={(e) => setVillageName(e.target.value)} />
                                    <InputField label="4.6 Name of Gram Panchayat (As Per LGD)" placeholder="Enter Gram Panchayat Name" value={gramPanchayat} onChange={(e) => setGramPanchayat(e.target.value)} />
                                </>
                            )}

                            {locationType === "Urban" && (
                                <>
                                    <InputField label="4.7 Urban Local bodies (As per LGD)" placeholder="Municipalities/Nagar Panchayat etc." value={urbanLocalBody} onChange={(e) => setUrbanLocalBody(e.target.value)} />
                                    <InputField label="4.8 Ward Name (As Per LGD)" placeholder="Enter Ward Name" value={wardName} onChange={(e) => setWardName(e.target.value)} />
                                </>
                            )}

                            <InputField label="4.9 Name of the Cluster Resource Centre (CRC)" placeholder="Enter CRC Name" value={crcName} onChange={(e) => setCrcName(e.target.value)} />
                            <InputField label="4.10 Name of the Assembly Constituency" placeholder="Enter Assembly Constituency" value={assemblyConstituency} onChange={(e) => setAssemblyConstituency(e.target.value)} />
                            <InputField label="4.11 Name of the Parliamentary Constituency" placeholder="Enter Parliamentary Constituency" value={parliamentaryConstituency} onChange={(e) => setParliamentaryConstituency(e.target.value)} />

                            <InputField label="4.12 District" placeholder="District" value={district} onChange={(e) => setDistrict(e.target.value)} />
                            <InputField label="4.13 Taluka" placeholder="Taluka" value={taluka} onChange={(e) => setTaluka(e.target.value)} />
                            <InputField label="4.14 GPS Latitude" placeholder="e.g. 19.0760" />
                            <InputField label="4.15 GPS Longitude" placeholder="e.g. 72.8777" />
                            <InputField label="4.16 Email" type="email" placeholder="school@example.com" />
                            <InputField label="4.17 Phone" type="tel" placeholder="+91 XXXXX XXXXX" />
                        </div>
                    )
                }

                {/* Step 4: Infrastructure */}
                {
                    currentStep === 4 && (
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-lg font-semibold text-neutral-800 mb-1">Infrastructure Details</h3>
                                <p className="text-sm text-neutral-500 mb-6">Provide details regarding the school building, classrooms, and facilities.</p>

                                {/* 2.1 Status of Present School Building */}
                                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4 mb-6">
                                    <h4 className="font-semibold text-base text-primary-800 pb-2 border-b border-neutral-100">5.1 Status of the present school building?</h4>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <SelectField
                                                label="Building Ownership Status"
                                                value={buildingStatus}
                                                onChange={(e) => setBuildingStatus(e.target.value)}
                                                options={["1-Private", "2-Rented", "3-Government", "4-Government school in a rent free building", "5-NO Building", "7-Building Under Construction", "10-School running in other Department Building"]}
                                            />
                                            {applicationType === "New Recognition" && buildingStatus === "2-Rented" && (
                                                <UploadField label="Upload Rent Agreement (Min 3-5 Years)" />
                                            )}
                                            {applicationType === "Upgradation" && buildingStatus === "5-NO Building" && (
                                                <p className="text-xs font-bold text-red-600 bg-red-50 p-2 rounded border border-red-200">
                                                    ❌ Upgradation Blocker: Cannot upgrade a school that has no physical structure.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 2.2 Type of the school building */}
                                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4 mb-6">
                                    <h4 className="font-semibold text-base text-primary-800 pb-2 border-b border-neutral-100">5.2 Type of the school building</h4>

                                    <div className="grid md:grid-cols-2 gap-6 mb-4">
                                        <InputField
                                            label="Total Number of Active building blocks of the school"
                                            type="number"
                                            value={activeBuildingBlocks}
                                            onChange={(e) => setActiveBuildingBlocks(e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6 mb-4">
                                        <div className="space-y-4">
                                            <h5 className="font-medium text-sm text-neutral-700">Type Breakdown</h5>
                                            <InputField label="Pucca Building" type="number" value={buildingPucca} onChange={(e) => setBuildingPucca(e.target.value)} placeholder="0" />
                                            <InputField label="Partially Pucca (building with Pucca walls and floor without concrete roof)" type="number" value={buildingPartiallyPucca} onChange={(e) => setBuildingPartiallyPucca(e.target.value)} placeholder="0" />
                                            <InputField label="Kuchcha Building" type="number" value={buildingKuchcha} onChange={(e) => setBuildingKuchcha(e.target.value)} placeholder="0" />
                                            <InputField label="Tent" type="number" value={buildingTent} onChange={(e) => setBuildingTent(e.target.value)} placeholder="0" />

                                            {applicationType === "New Recognition" && (Number(buildingKuchcha) > 0 || Number(buildingTent) > 0) && (
                                                <p className="text-xs font-bold text-red-600 bg-red-50 p-2 rounded border border-red-200">
                                                    ⚠️ Major Warning: Recognition is rarely granted for non-permanent structures.
                                                </p>
                                            )}

                                            {(Number(buildingPucca) + Number(buildingPartiallyPucca) + Number(buildingKuchcha) + Number(buildingTent)) !== Number(activeBuildingBlocks) && activeBuildingBlocks !== "" && (
                                                <p className="text-xs font-bold text-amber-600 bg-amber-50 p-2 rounded border border-amber-200 mt-2">
                                                    ⚠️ Validation Error: Breakdown sum must equal "{activeBuildingBlocks}".
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <h5 className="font-medium text-sm text-neutral-700">Storey Breakdown</h5>
                                            <InputField label="Single Storey" type="number" value={storeySingle} onChange={(e) => setStoreySingle(e.target.value)} placeholder="0" />
                                            <InputField label="Double Storey" type="number" value={storeyDouble} onChange={(e) => setStoreyDouble(e.target.value)} placeholder="0" />
                                            <InputField label="Triple Storey" type="number" value={storeyTriple} onChange={(e) => setStoreyTriple(e.target.value)} placeholder="0" />
                                            <InputField label="More than Three Storeys" type="number" value={storeyMulti} onChange={(e) => setStoreyMulti(e.target.value)} placeholder="0" />

                                            {(Number(storeySingle) + Number(storeyDouble) + Number(storeyTriple) + Number(storeyMulti)) !== Number(activeBuildingBlocks) && activeBuildingBlocks !== "" && (
                                                <p className="text-xs font-bold text-amber-600 bg-amber-50 p-2 rounded border border-amber-200 mt-2">
                                                    ⚠️ Validation Error: Storey breakdown sum must equal "{activeBuildingBlocks}".
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <InputField
                                                label="No of Dilapidated Building"
                                                type="number"
                                                value={buildingDilapidated}
                                                onChange={(e) => setBuildingDilapidated(e.target.value)}
                                                placeholder="0"
                                            />
                                            {applicationType === "Renewal" && Number(buildingDilapidated) > 0 && (
                                                <UploadField label="Upload Fitness Certificate from PWD" />
                                            )}
                                        </div>
                                        <InputField
                                            label="No of Building Under Construction"
                                            type="number"
                                            value={buildingUnderConstruction}
                                            onChange={(e) => setBuildingUnderConstruction(e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                {/* 2.3 Classrooms */}
                                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6 mb-6">
                                    <h4 className="font-semibold text-base text-primary-800 pb-2 border-b border-neutral-100">5.3 Detail of Classrooms available in the school</h4>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <InputField label="Pre-Primary" type="number" value={classroomsPrePrimary} onChange={(e) => setClassroomsPrePrimary(e.target.value)} placeholder="0" />
                                        <InputField label="Primary" type="number" value={classroomsPrimary} onChange={(e) => setClassroomsPrimary(e.target.value)} placeholder="0" />
                                        <InputField label="Upper Primary" type="number" value={classroomsUpperPrimary} onChange={(e) => setClassroomsUpperPrimary(e.target.value)} placeholder="0" />
                                        <InputField label="Secondary" type="number" value={classroomsSecondary} onChange={(e) => setClassroomsSecondary(e.target.value)} placeholder="0" />
                                        <InputField label="Higher Secondary" type="number" value={classroomsHigherSecondary} onChange={(e) => setClassroomsHigherSecondary(e.target.value)} placeholder="0" />
                                        <InputField label="Currently not in use" type="number" value={classroomsNotInUse} onChange={(e) => setClassroomsNotInUse(e.target.value)} placeholder="0" />
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-6 pt-4 border-t border-neutral-100">
                                        <div className="space-y-2">
                                            <InputField label="Total Number of Rooms for Instructional purposes" type="number" value={totalInstructionalRooms} onChange={(e) => setTotalInstructionalRooms(e.target.value)} placeholder="0" />
                                            {(Number(classroomsPrePrimary) + Number(classroomsPrimary) + Number(classroomsUpperPrimary) + Number(classroomsSecondary) + Number(classroomsHigherSecondary) + Number(classroomsNotInUse)) !== Number(totalInstructionalRooms) && totalInstructionalRooms !== "" && (
                                                <p className="text-[10px] text-amber-600 font-bold bg-amber-50 p-2 rounded border border-amber-200 mt-2">
                                                    ⚠️ Mismatch: Does not equal sum of categories.
                                                </p>
                                            )}
                                            {applicationType === "New Recognition" && Number(totalInstructionalRooms) < 5 && totalInstructionalRooms !== "" && (
                                                <p className="text-[10px] text-red-600 font-bold bg-red-50 p-2 rounded border border-red-200 mt-2">
                                                    ❌ Infrastructure Gap: Too few rooms for recognition.
                                                </p>
                                            )}
                                        </div>
                                        <InputField label="Number of classrooms under construction" type="number" value={classroomsUnderConstruction} onChange={(e) => setClassroomsUnderConstruction(e.target.value)} placeholder="0" />
                                        <InputField label="Number of classrooms in dilapidated condition" type="number" value={classroomsDilapidated} onChange={(e) => setClassroomsDilapidated(e.target.value)} placeholder="0" />
                                    </div>

                                    {/* 2.3(b) Grid */}
                                    <div className="pt-4 border-t border-neutral-100">
                                        <h5 className="font-medium text-sm text-neutral-700 mb-4">5.3(b) Out of the Total Classrooms used for instructional purposes, details by condition</h5>
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse border border-neutral-200 text-sm">
                                                <thead>
                                                    <tr className="bg-neutral-50 text-neutral-700">
                                                        <th className="border border-neutral-200 p-2 text-left">Type</th>
                                                        <th className="border border-neutral-200 p-2 text-center w-32">Good Condition</th>
                                                        <th className="border border-neutral-200 p-2 text-center w-32">Need Minor Repair</th>
                                                        <th className="border border-neutral-200 p-2 text-center w-32">Need Major Repair</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td className="border border-neutral-200 p-2">Pucca</td>
                                                        <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1 text-center" value={condPuccaGood} onChange={(e) => setCondPuccaGood(e.target.value)} placeholder="0" /></td>
                                                        <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1 text-center" value={condPuccaMinor} onChange={(e) => setCondPuccaMinor(e.target.value)} placeholder="0" /></td>
                                                        <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1 text-center" value={condPuccaMajor} onChange={(e) => setCondPuccaMajor(e.target.value)} placeholder="0" /></td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border border-neutral-200 p-2">Partially Pucca</td>
                                                        <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1 text-center" value={condPartiallyPuccaGood} onChange={(e) => setCondPartiallyPuccaGood(e.target.value)} placeholder="0" /></td>
                                                        <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1 text-center" value={condPartiallyPuccaMinor} onChange={(e) => setCondPartiallyPuccaMinor(e.target.value)} placeholder="0" /></td>
                                                        <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1 text-center" value={condPartiallyPuccaMajor} onChange={(e) => setCondPartiallyPuccaMajor(e.target.value)} placeholder="0" /></td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border border-neutral-200 p-2">Kuchcha</td>
                                                        <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1 text-center" value={condKuchchaGood} onChange={(e) => setCondKuchchaGood(e.target.value)} placeholder="0" /></td>
                                                        <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1 text-center" value={condKuchchaMinor} onChange={(e) => setCondKuchchaMinor(e.target.value)} placeholder="0" /></td>
                                                        <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1 text-center" value={condKuchchaMajor} onChange={(e) => setCondKuchchaMajor(e.target.value)} placeholder="0" /></td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border border-neutral-200 p-2">Tent</td>
                                                        <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1 text-center" value={condTentGood} onChange={(e) => setCondTentGood(e.target.value)} placeholder="0" /></td>
                                                        <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1 text-center" value={condTentMinor} onChange={(e) => setCondTentMinor(e.target.value)} placeholder="0" /></td>
                                                        <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1 text-center" value={condTentMajor} onChange={(e) => setCondTentMajor(e.target.value)} placeholder="0" /></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        {(Number(condPuccaMajor) > 0 || Number(condPartiallyPuccaMajor) > 0 || Number(condKuchchaMajor) > 0 || Number(condTentMajor) > 0) && (
                                            <div className="mt-4">
                                                <p className="text-xs font-bold text-red-600 mb-2">Major repairs required. Please upload stability certificate.</p>
                                                <UploadField label="Upload Structural Stability Certificate" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 2.4 Boundary Wall */}
                                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4 mb-6">
                                    <h4 className="font-semibold text-base text-primary-800 pb-2 border-b border-neutral-100">5.4 Boundary Wall</h4>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <SelectField
                                                label="Whether Boundary Wall is available?"
                                                value={boundaryWall}
                                                onChange={(e) => setBoundaryWall(e.target.value)}
                                                options={["1-Pucca", "2-Pucca but broken", "3-Barbed wire fencing", "4-Hedges", "5-No boundary walls", "6-Others", "7-Partial", "8-Under Construction"]}
                                            />
                                            {applicationType === "New Recognition" && ["3-Barbed wire fencing", "4-Hedges", "5-No boundary walls"].includes(boundaryWall) && (
                                                <p className="text-[10px] text-red-600 font-bold bg-red-50 p-2 rounded border border-red-200 mt-2">
                                                    ❌ Security Risk: Proper concrete boundary walls are usually required for new recognition.
                                                </p>
                                            )}
                                            {applicationType === "Renewal" && boundaryWall === "2-Pucca but broken" && (
                                                <UploadField label="Upload Repair Plan / Quote" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 2.5 Electricity */}
                                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4 mb-6">
                                    <h4 className="font-semibold text-base text-primary-800 pb-2 border-b border-neutral-100">5.5 Electricity</h4>

                                    <div className="grid md:grid-cols-2 gap-6 mb-4">
                                        <SelectField
                                            label="(a) Whether Electricity connection is available?"
                                            value={hasElectricity}
                                            onChange={(e) => setHasElectricity(e.target.value)}
                                            options={["1-Yes", "2-No", "3-Yes but not functional"]}
                                        />
                                    </div>

                                    {hasElectricity !== "2-No" && hasElectricity !== "" && (
                                        <div className="grid md:grid-cols-3 gap-6 pt-4 border-t border-neutral-100 mb-4">
                                            <div className="space-y-2">
                                                <InputField label="Number of classrooms having Fans" type="number" value={classroomsWithFans} onChange={(e) => setClassroomsWithFans(e.target.value)} placeholder="0" />
                                                {Number(classroomsWithFans) > Number(totalInstructionalRooms) && totalInstructionalRooms !== "" && (
                                                    <p className="text-[10px] text-amber-600 font-bold bg-amber-50 p-2 rounded border border-amber-200 mt-2">
                                                        ⚠️ Exceeds total instructional rooms.
                                                    </p>
                                                )}
                                            </div>
                                            <InputField label="Number of classrooms having A/Cs" type="number" value={classroomsWithACs} onChange={(e) => setClassroomsWithACs(e.target.value)} placeholder="0" />
                                            <InputField label="Number of classrooms having Heaters" type="number" value={classroomsWithHeaters} onChange={(e) => setClassroomsWithHeaters(e.target.value)} placeholder="0" />
                                        </div>
                                    )}

                                    <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-neutral-100">
                                        <SelectField
                                            label="(b) Whether Solar Panel is available?"
                                            value={hasSolarPanel}
                                            onChange={(e) => setHasSolarPanel(e.target.value)}
                                            options={["1-Yes", "2-No"]}
                                        />
                                    </div>
                                </div>

                                {/* 2.6 Details of Rooms other than Classrooms (excluding toilets) */}
                                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6 mb-6">
                                    <h4 className="font-semibold text-base text-primary-800 pb-2 border-b border-neutral-100">5.6 Details of Rooms other than Classrooms (excluding toilets)</h4>

                                    <div className="space-y-4">
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse border border-neutral-200 text-sm">
                                                <thead>
                                                    <tr className="bg-neutral-50 text-neutral-700">
                                                        <th className="border border-neutral-200 p-3 text-center w-24">Sl. No.</th>
                                                        <th className="border border-neutral-200 p-3 text-left">Particulars</th>
                                                        <th className="border border-neutral-200 p-3 text-center w-56">Availability</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="bg-white hover:bg-neutral-50">
                                                        <td className="border border-neutral-200 p-2 text-center text-neutral-500">(i)</td>
                                                        <td className="border border-neutral-200 p-2 font-medium text-neutral-700">Separate room for Head of the School/Head Teacher/ Principal?</td>
                                                        <td className="border border-neutral-200 p-1">
                                                            <select className="w-full bg-transparent p-1 focus:outline-none text-center cursor-pointer" value={hasPrincipalRoom} onChange={(e) => setHasPrincipalRoom(e.target.value)}>
                                                                <option value="">Select</option><option value="1-Yes">1-Yes</option><option value="2-No">2-No</option>
                                                            </select>
                                                        </td>
                                                    </tr>
                                                    <tr className="bg-white hover:bg-neutral-50">
                                                        <td className="border border-neutral-200 p-2 text-center text-neutral-500">(ii)</td>
                                                        <td className="border border-neutral-200 p-2 font-medium text-neutral-700">Separate room for Library</td>
                                                        <td className="border border-neutral-200 p-1">
                                                            <select className="w-full bg-transparent p-1 focus:outline-none text-center cursor-pointer" value={hasLibraryRoom} onChange={(e) => setHasLibraryRoom(e.target.value)}>
                                                                <option value="">Select</option><option value="1-Yes">1-Yes</option><option value="2-No">2-No</option>
                                                            </select>
                                                        </td>
                                                    </tr>
                                                    <tr className="bg-white hover:bg-neutral-50">
                                                        <td className="border border-neutral-200 p-2 text-center text-neutral-500">(iii)</td>
                                                        <td className="border border-neutral-200 p-2 font-medium text-neutral-700">Separate room for Assistant Head Teacher/Vice Principal?</td>
                                                        <td className="border border-neutral-200 p-1">
                                                            <select className="w-full bg-transparent p-1 focus:outline-none text-center cursor-pointer" value={hasVicePrincipalRoom} onChange={(e) => setHasVicePrincipalRoom(e.target.value)}>
                                                                <option value="">Select</option><option value="1-Yes">1-Yes</option><option value="2-No">2-No</option>
                                                            </select>
                                                        </td>
                                                    </tr>
                                                    <tr className="bg-white hover:bg-neutral-50">
                                                        <td className="border border-neutral-200 p-2 text-center text-neutral-500">(iv)</td>
                                                        <td className="border border-neutral-200 p-2 font-medium text-neutral-700">Separate Common room for girls</td>
                                                        <td className="border border-neutral-200 p-1">
                                                            <select className="w-full bg-transparent p-1 focus:outline-none text-center cursor-pointer" value={hasGirlsCommonRoom} onChange={(e) => setHasGirlsCommonRoom(e.target.value)}>
                                                                <option value="">Select</option><option value="1-Yes">1-Yes</option><option value="2-No">2-No</option>
                                                            </select>
                                                        </td>
                                                    </tr>
                                                    <tr className="bg-white hover:bg-neutral-50">
                                                        <td className="border border-neutral-200 p-2 text-center text-neutral-500">(v)</td>
                                                        <td className="border border-neutral-200 p-2 font-medium text-neutral-700">Staffroom for teachers</td>
                                                        <td className="border border-neutral-200 p-1">
                                                            <select className="w-full bg-transparent p-1 focus:outline-none text-center cursor-pointer" value={hasStaffroom} onChange={(e) => setHasStaffroom(e.target.value)}>
                                                                <option value="">Select</option><option value="1-Yes">1-Yes</option><option value="2-No">2-No</option>
                                                            </select>
                                                        </td>
                                                    </tr>
                                                    <tr className="bg-white hover:bg-neutral-50">
                                                        <td className="border border-neutral-200 p-2 text-center text-neutral-500">(vi)</td>
                                                        <td className="border border-neutral-200 p-2 font-medium text-neutral-700">Co-curricular activity room/arts and crafts room</td>
                                                        <td className="border border-neutral-200 p-1">
                                                            <select className="w-full bg-transparent p-1 focus:outline-none text-center cursor-pointer" value={hasCoCurricularRoom} onChange={(e) => setHasCoCurricularRoom(e.target.value)}>
                                                                <option value="">Select</option><option value="1-Yes">1-Yes</option><option value="2-No">2-No</option>
                                                            </select>
                                                        </td>
                                                    </tr>
                                                    <tr className="bg-white hover:bg-neutral-50">
                                                        <td className="border border-neutral-200 p-2 text-center text-neutral-500">(vii)</td>
                                                        <td className="border border-neutral-200 p-2 font-medium text-neutral-700">Number of Laboratory Rooms including Computer Labs</td>
                                                        <td className="border border-neutral-200 p-1">
                                                            <input type="number" className="w-full bg-transparent p-1 focus:outline-none text-center" value={labCount} onChange={(e) => setLabCount(e.target.value)} placeholder="0" />
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
                                            <span className="font-medium text-blue-900">5.6(a) Auto-Calculated Total Other Rooms:</span>
                                            <span className="text-xl font-bold text-blue-700">
                                                {
                                                    (hasPrincipalRoom === "1-Yes" ? 1 : 0) +
                                                    (hasLibraryRoom === "1-Yes" ? 1 : 0) +
                                                    (hasVicePrincipalRoom === "1-Yes" ? 1 : 0) +
                                                    (hasGirlsCommonRoom === "1-Yes" ? 1 : 0) +
                                                    (hasStaffroom === "1-Yes" ? 1 : 0) +
                                                    (hasCoCurricularRoom === "1-Yes" ? 1 : 0) +
                                                    (Number(labCount) || 0)
                                                }
                                            </span>
                                        </div>

                                        {applicationType === "New Recognition" && (hasPrincipalRoom === "2-No" || hasLibraryRoom === "2-No" || hasStaffroom === "2-No") && (
                                            <p className="text-[10px] text-red-600 font-bold bg-red-50 p-2 rounded border border-red-200">
                                                ❌ Administrative Requirement: Principal, Library, and Staffroom are mandatory for recognition.
                                            </p>
                                        )}
                                        {applicationType === "Upgradation" && hasGirlsCommonRoom === "2-No" && (
                                            <p className="text-[10px] text-red-600 font-bold bg-red-50 p-2 rounded border border-red-200">
                                                ❌ Safety Audit: Girls Common Room is mandatory for Upgradation in Co-ed/Girls schools.
                                            </p>
                                        )}
                                        {applicationType === "Upgradation" && (Number(labCount) || 0) === 0 && (
                                            <p className="text-[10px] text-red-600 font-bold bg-red-50 p-2 rounded border border-red-200">
                                                ❌ Upgradation Blocker: Lab count cannot be zero for Secondary/Higher Secondary upgradation.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* 2.7 Toilets/Urinals */}
                                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6 mb-6">
                                    <h4 className="font-semibold text-base text-primary-800 pb-2 border-b border-neutral-100">5.7 Does the School have Toilet(s)/Urinal(s)?</h4>

                                    <div className="grid md:grid-cols-2 gap-6 mb-4">
                                        <div className="space-y-3">
                                            <SelectField
                                                label="Toilet Availability (1-Yes, 2-No)"
                                                value={hasToilets}
                                                onChange={(e) => setHasToilets(e.target.value)}
                                                options={["1-Yes", "2-No"]}
                                            />
                                            {hasToilets === "2-No" && (
                                                <p className="text-sm font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                                                    ⛔ CRITICAL BLOCKER: A school cannot legally operate without toilets.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {hasToilets === "1-Yes" && (
                                        <>
                                            <div className="overflow-x-auto">
                                                <table className="w-full border-collapse border border-neutral-200 text-sm">
                                                    <thead>
                                                        <tr>
                                                            <th className="border border-neutral-200 p-2 bg-neutral-50" colSpan={2}></th>
                                                            <th className="border border-neutral-200 p-2 bg-blue-50 text-blue-800" colSpan={3}>Boys</th>
                                                            <th className="border border-neutral-200 p-2 bg-pink-50 text-pink-800" colSpan={3}>Girls</th>
                                                        </tr>
                                                        <tr className="bg-neutral-50 text-neutral-700">
                                                            <th className="border border-neutral-200 p-2 text-center w-12">Sl. No</th>
                                                            <th className="border border-neutral-200 p-2 text-left">Description</th>
                                                            <th className="border border-neutral-200 p-2 text-center w-20">Total</th>
                                                            <th className="border border-neutral-200 p-2 text-center w-20">Func</th>
                                                            <th className="border border-neutral-200 p-2 text-center w-20">Running Water</th>
                                                            <th className="border border-neutral-200 p-2 text-center w-20">Total</th>
                                                            <th className="border border-neutral-200 p-2 text-center w-20">Func</th>
                                                            <th className="border border-neutral-200 p-2 text-center w-20">Running Water</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr className="bg-white hover:bg-neutral-50">
                                                            <td className="border border-neutral-200 p-2 text-center text-neutral-500">(i)</td>
                                                            <td className="border border-neutral-200 p-2">Number of Toilet seats available excluding CWSN friendly Toilets</td>
                                                            <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1 text-center" value={toiletBoysTotal} onChange={(e) => setToiletBoysTotal(e.target.value)} placeholder="0" /></td>
                                                            <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1 text-center" value={toiletBoysFunc} onChange={(e) => setToiletBoysFunc(e.target.value)} placeholder="0" /></td>
                                                            <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1 text-center" value={toiletBoysWater} onChange={(e) => setToiletBoysWater(e.target.value)} placeholder="0" /></td>
                                                            <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1 text-center" value={toiletGirlsTotal} onChange={(e) => setToiletGirlsTotal(e.target.value)} placeholder="0" /></td>
                                                            <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1 text-center" value={toiletGirlsFunc} onChange={(e) => setToiletGirlsFunc(e.target.value)} placeholder="0" /></td>
                                                            <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1 text-center" value={toiletGirlsWater} onChange={(e) => setToiletGirlsWater(e.target.value)} placeholder="0" /></td>
                                                        </tr>
                                                        <tr className="bg-white hover:bg-neutral-50">
                                                            <td className="border border-neutral-200 p-2 text-center text-neutral-500">(ii)</td>
                                                            <td className="border border-neutral-200 p-2">Number of CWSN friendly Toilet seats</td>
                                                            <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1 text-center" value={cwsnBoysTotal} onChange={(e) => setCwsnBoysTotal(e.target.value)} placeholder="0" /></td>
                                                            <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1 text-center" value={cwsnBoysFunc} onChange={(e) => setCwsnBoysFunc(e.target.value)} placeholder="0" /></td>
                                                            <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1 text-center" value={cwsnBoysWater} onChange={(e) => setCwsnBoysWater(e.target.value)} placeholder="0" /></td>
                                                            <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1 text-center" value={cwsnGirlsTotal} onChange={(e) => setCwsnGirlsTotal(e.target.value)} placeholder="0" /></td>
                                                            <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1 text-center" value={cwsnGirlsFunc} onChange={(e) => setCwsnGirlsFunc(e.target.value)} placeholder="0" /></td>
                                                            <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1 text-center" value={cwsnGirlsWater} onChange={(e) => setCwsnGirlsWater(e.target.value)} placeholder="0" /></td>
                                                        </tr>
                                                        <tr className="bg-neutral-100 font-medium">
                                                            <td className="border border-neutral-200 p-2 text-center text-neutral-500"></td>
                                                            <td className="border border-neutral-200 p-2">Total Number of Toilet seats including CWSN</td>
                                                            <td className="border border-neutral-200 p-2 text-center">{(Number(toiletBoysTotal) || 0) + (Number(cwsnBoysTotal) || 0)}</td>
                                                            <td className="border border-neutral-200 p-2 text-center">{(Number(toiletBoysFunc) || 0) + (Number(cwsnBoysFunc) || 0)}</td>
                                                            <td className="border border-neutral-200 p-2 text-center">{(Number(toiletBoysWater) || 0) + (Number(cwsnBoysWater) || 0)}</td>
                                                            <td className="border border-neutral-200 p-2 text-center">{(Number(toiletGirlsTotal) || 0) + (Number(cwsnGirlsTotal) || 0)}</td>
                                                            <td className="border border-neutral-200 p-2 text-center">{(Number(toiletGirlsFunc) || 0) + (Number(cwsnGirlsFunc) || 0)}</td>
                                                            <td className="border border-neutral-200 p-2 text-center">{(Number(toiletGirlsWater) || 0) + (Number(cwsnGirlsWater) || 0)}</td>
                                                        </tr>
                                                        <tr className="bg-white hover:bg-neutral-50">
                                                            <td className="border border-neutral-200 p-2 text-center text-neutral-500">(iii)</td>
                                                            <td className="border border-neutral-200 p-2">Total Number of Urinals available</td>
                                                            <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1 text-center" value={urinalsBoysTotal} onChange={(e) => setUrinalsBoysTotal(e.target.value)} placeholder="0" /></td>
                                                            <td className="border border-neutral-200 p-1 bg-neutral-100" colSpan={2}></td>
                                                            <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1 text-center" value={urinalsGirlsTotal} onChange={(e) => setUrinalsGirlsTotal(e.target.value)} placeholder="0" /></td>
                                                            <td className="border border-neutral-200 p-1 bg-neutral-100" colSpan={2}></td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="space-y-4">
                                                {((Number(toiletGirlsTotal) || 0) + (Number(cwsnGirlsTotal) || 0)) === 0 && (
                                                    <p className="text-[10px] text-red-600 font-bold bg-red-50 p-2 rounded border border-red-200">
                                                        ❌ Gender Audit: Number of girls toilets cannot be zero.
                                                    </p>
                                                )}
                                                {["Renewal", "Upgradation"].includes(applicationType) && ((Number(cwsnBoysTotal) || 0) + (Number(cwsnGirlsTotal) || 0)) === 0 && (
                                                    <p className="text-[10px] text-red-600 font-bold bg-red-50 p-2 rounded border border-red-200">
                                                        ❌ Compliance Alert: CWSN friendly toilets are mandatory under RTE compliance.
                                                    </p>
                                                )}
                                                {(Number(toiletBoysFunc) > Number(toiletBoysTotal) || Number(toiletGirlsFunc) > Number(toiletGirlsTotal)) && (
                                                    <p className="text-[10px] text-amber-600 font-bold bg-amber-50 p-2 rounded border border-amber-200">
                                                        ⚠️ Logic Error: Functional toilets cannot be greater than Total toilets.
                                                    </p>
                                                )}
                                                {applicationType === "Renewal" && ((Number(toiletBoysFunc) < Number(toiletBoysTotal)) || (Number(toiletGirlsFunc) < Number(toiletGirlsTotal))) && (
                                                    <div className="mt-4 p-4 border border-blue-200 bg-blue-50 rounded-xl space-y-2">
                                                        <p className="text-sm font-bold text-blue-800">Maintenance Action Required</p>
                                                        <p className="text-xs text-blue-700 mb-2">Since functional count is lower than total, please upload a repair plan or photos of repairs.</p>
                                                        <UploadField label="Upload Maintenance/Repair Plan" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Detailed Wash Facilities */}
                                            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-neutral-100">
                                                <div className="space-y-4">
                                                    <h5 className="font-medium text-sm text-neutral-700">(b) Number of Toilets under Construction</h5>
                                                    <InputField label="Number of Boys Toilet Under Construction" type="number" value={toiletsConstBoys} onChange={(e) => setToiletsConstBoys(e.target.value)} placeholder="0" />
                                                    <InputField label="Number of Girls Toilet under Construction" type="number" value={toiletsConstGirls} onChange={(e) => setToiletsConstGirls(e.target.value)} placeholder="0" />
                                                </div>
                                                <div className="space-y-4">
                                                    <SelectField label="(c) Is hand washing facility with soap available near toilets/urinals block?" value={hasHandWashingNearToilets} onChange={(e) => setHasHandWashingNearToilets(e.target.value)} options={["1-Yes", "2-No"]} />
                                                    <div className="space-y-2">
                                                        <SelectField label="(d) Location of the Toilet facility available?" value={toiletLocation} onChange={(e) => setToiletLocation(e.target.value)} options={["1-Inside the School Building", "2-Outside the Schools Building but in the School Premises"]} />
                                                        {applicationType === "New Recognition" && toiletLocation === "2-Outside the Schools Building but in the School Premises" && (
                                                            <p className="text-[10px] text-amber-600 font-bold bg-amber-50 p-2 rounded border border-amber-200">
                                                                ⚠️ Safety Access Warning: Provide proper covered walkways for students if outside.
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-neutral-100">
                                                <div className="space-y-2">
                                                    <SelectField label="(e) Whether incinerator is available in Girl's toilet?" value={hasIncinerator} onChange={(e) => setHasIncinerator(e.target.value)} options={["1-Yes", "2-No", "3-Yes, but Not Functional"]} />
                                                    {applicationType === "Upgradation" && hasIncinerator === "2-No" && (
                                                        <p className="text-[10px] text-red-600 font-bold bg-red-50 p-2 rounded border border-red-200">
                                                            ❌ Hygiene Audit: Incinerator is mandatory for Upgradation.
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <SelectField label="(f) Whether the school has Sanitary Pad vending machine available?" value={hasPadVendingMachine} onChange={(e) => setHasPadVendingMachine(e.target.value)} options={["1-Yes", "2-No", "3-Yes, but not functional", "4-Not Available, Pads available with Class Teachers"]} />
                                                    {applicationType === "Upgradation" && (hasPadVendingMachine === "2-No" || hasPadVendingMachine === "4-Not Available, Pads available with Class Teachers") && (
                                                        <p className="text-[10px] text-red-600 font-bold bg-red-50 p-2 rounded border border-red-200">
                                                            ❌ Hygiene Audit: Active Vending machine is required for Upgradation.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-neutral-100">
                                                <SelectField label="5.8 Whether hand washing facility with soap available for washing hands before and after meal?" value={hasHandWashingBeforeMeal} onChange={(e) => setHasHandWashingBeforeMeal(e.target.value)} options={["1-Yes", "2-No"]} />
                                                {hasHandWashingBeforeMeal === "1-Yes" && (
                                                    <InputField label="If 1-Yes, number of wash points" type="number" value={washPointsCount} onChange={(e) => setWashPointsCount(e.target.value)} placeholder="0" />
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* 2.9 Drinking Water */}
                                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6 mb-6">
                                    <h4 className="font-semibold text-base text-primary-800 pb-2 border-b border-neutral-100">5.9(a) Main Source of Drinking Water</h4>

                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse border border-neutral-200 text-sm">
                                            <thead>
                                                <tr className="bg-neutral-50 text-neutral-700">
                                                    <th className="border border-neutral-200 p-3 text-left">Source</th>
                                                    <th className="border border-neutral-200 p-3 text-center w-64">Availability (1-Yes, 2-No, 3-Yes..Not Func)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="bg-white hover:bg-neutral-50">
                                                    <td className="border border-neutral-200 p-2">Hand pumps/Bore well</td>
                                                    <td className="border border-neutral-200 p-1"><select className="w-full bg-transparent p-1 focus:outline-none text-center" value={waterHandPump} onChange={(e) => setWaterHandPump(e.target.value)}><option value="">Select</option><option value="1-Yes">1-Yes</option><option value="2-No">2-No</option><option value="3-Yes, but not Functional">3-Yes, but not Functional</option></select></td>
                                                </tr>
                                                <tr className="bg-white hover:bg-neutral-50">
                                                    <td className="border border-neutral-200 p-2">Protected Well</td>
                                                    <td className="border border-neutral-200 p-1"><select className="w-full bg-transparent p-1 focus:outline-none text-center" value={waterProtectedWell} onChange={(e) => setWaterProtectedWell(e.target.value)}><option value="">Select</option><option value="1-Yes">1-Yes</option><option value="2-No">2-No</option><option value="3-Yes, but not Functional">3-Yes, but not Functional</option></select></td>
                                                </tr>
                                                <tr className="bg-white hover:bg-neutral-50">
                                                    <td className="border border-neutral-200 p-2 text-amber-700 font-medium">Unprotected Well</td>
                                                    <td className="border border-neutral-200 p-1"><select className="w-full bg-transparent p-1 focus:outline-none text-center" value={waterUnprotectedWell} onChange={(e) => setWaterUnprotectedWell(e.target.value)}><option value="">Select</option><option value="1-Yes">1-Yes</option><option value="2-No">2-No</option><option value="3-Yes, but not Functional">3-Yes, but not Functional</option></select></td>
                                                </tr>
                                                <tr className="bg-white hover:bg-neutral-50">
                                                    <td className="border border-neutral-200 p-2">Tap water</td>
                                                    <td className="border border-neutral-200 p-1"><select className="w-full bg-transparent p-1 focus:outline-none text-center" value={waterTapWater} onChange={(e) => setWaterTapWater(e.target.value)}><option value="">Select</option><option value="1-Yes">1-Yes</option><option value="2-No">2-No</option><option value="3-Yes, but not Functional">3-Yes, but not Functional</option></select></td>
                                                </tr>
                                                <tr className="bg-white hover:bg-neutral-50">
                                                    <td className="border border-neutral-200 p-2">Packaged/Bottled Water</td>
                                                    <td className="border border-neutral-200 p-1"><select className="w-full bg-transparent p-1 focus:outline-none text-center" value={waterPackagedWater} onChange={(e) => setWaterPackagedWater(e.target.value)}><option value="">Select</option><option value="1-Yes">1-Yes</option><option value="2-No">2-No</option><option value="3-Yes, but not Functional">3-Yes, but not Functional</option></select></td>
                                                </tr>
                                                <tr className="bg-white hover:bg-neutral-50">
                                                    <td className="border border-neutral-200 p-2">Others: <input type="text" className="w-48 border-b border-neutral-300 ml-2 focus:outline-none focus:border-primary-500 bg-transparent" placeholder="Specify" /></td>
                                                    <td className="border border-neutral-200 p-1"><select className="w-full bg-transparent p-1 focus:outline-none text-center" value={waterOthers} onChange={(e) => setWaterOthers(e.target.value)}><option value="">Select</option><option value="1-Yes">1-Yes</option><option value="2-No">2-No</option><option value="3-Yes, but not Functional">3-Yes, but not Functional</option></select></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="space-y-2">
                                        {[waterHandPump, waterProtectedWell, waterUnprotectedWell, waterTapWater, waterPackagedWater, waterOthers].every(v => v !== "1-Yes" && v !== "") && (
                                            <p className="text-[10px] text-red-600 font-bold bg-red-50 p-2 rounded border border-red-200">
                                                ⛔ BLOCKER: Mandatory at least one functional ("1-Yes") source for any application.
                                            </p>
                                        )}
                                        {waterUnprotectedWell === "1-Yes" && [waterHandPump, waterProtectedWell, waterTapWater, waterPackagedWater].every(v => v !== "1-Yes") && (
                                            <p className="text-[10px] text-amber-600 font-bold bg-amber-50 p-2 rounded border border-amber-200">
                                                ⚠️ High Priority: Unprotected well is the only functional source. Immediate treatment and testing required.
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-neutral-100">
                                        <SelectField label="(b) Whether water purifier/RO is available in the school" value={hasWaterPurifier} onChange={(e) => setHasWaterPurifier(e.target.value)} options={["1-Yes", "2-No", "3-Yes, but not Functional"]} />
                                        <div className="space-y-3">
                                            <SelectField label="(c) Whether Drinking water quality is tested from water testing lab?" value={hasWaterQualityTested} onChange={(e) => setHasWaterQualityTested(e.target.value)} options={["1-Yes", "2-No"]} />
                                            {applicationType === "Renewal" && hasWaterQualityTested === "1-Yes" && (
                                                <UploadField label="Upload Water Quality Test Report" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 2.10 Rain Water Harvesting */}
                                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4 mb-6">
                                    <h4 className="font-semibold text-base text-primary-800 pb-2 border-b border-neutral-100">5.10 Does the school have provision for rain water harvesting?</h4>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <SelectField
                                                label="Availability"
                                                value={hasRainWaterHarvesting}
                                                onChange={(e) => setHasRainWaterHarvesting(e.target.value)}
                                                options={["1-Yes", "2-No", "3-Yes, but not functional"]}
                                            />
                                            {applicationType === "New Recognition" && hasRainWaterHarvesting === "2-No" && (
                                                <p className="text-[10px] text-red-600 font-bold bg-red-50 p-2 rounded border border-red-200 mt-2">
                                                    ⛔ Legal Blocker: Recognition cannot be issued if RWH is missing in mandatory zones.
                                                </p>
                                            )}
                                            {applicationType === "Renewal" && hasRainWaterHarvesting === "2-No" && (
                                                <p className="text-[10px] text-amber-600 font-bold bg-amber-50 p-2 rounded border border-amber-200 mt-2">
                                                    ⚠️ High Risk: Failure to install RWH in mandatory zones can lead to withdrawal of recognition or heavy fines.
                                                </p>
                                            )}
                                            {applicationType === "Upgradation" && hasRainWaterHarvesting === "3-Yes, but not functional" && (
                                                <p className="text-[10px] text-blue-600 font-bold bg-blue-50 p-2 rounded border border-blue-200 mt-2">
                                                    ℹ️ Action Required: Repair RWH. Functional RWH is a key part of the "Green School" rating for higher levels.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 2.11 Library Facilities */}
                                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6 mb-6">
                                    <h4 className="font-semibold text-base text-primary-800 pb-2 border-b border-neutral-100">5.11(a) Whether the school has Library facility/Book Bank/Reading Corner?</h4>

                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse border border-neutral-200 text-sm">
                                            <thead>
                                                <tr className="bg-neutral-50 text-neutral-700">
                                                    <th className="border border-neutral-200 p-3 text-left">Facilities</th>
                                                    <th className="border border-neutral-200 p-3 text-center w-56">Availability (1-Yes, 2-No)</th>
                                                    <th className="border border-neutral-200 p-3 text-center w-64">Total numbers of books</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="bg-white hover:bg-neutral-50">
                                                    <td className="border border-neutral-200 p-2 font-medium">Library</td>
                                                    <td className="border border-neutral-200 p-1"><select className="w-full bg-transparent p-1 focus:outline-none text-center cursor-pointer" value={hasLibrary} onChange={(e) => setHasLibrary(e.target.value)}><option value="">Select</option><option value="1-Yes">1-Yes</option><option value="2-No">2-No</option></select></td>
                                                    <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1 text-center focus:outline-none" value={libraryBooks} onChange={(e) => setLibraryBooks(e.target.value)} placeholder="0" disabled={hasLibrary === "2-No"} /></td>
                                                </tr>
                                                <tr className="bg-white hover:bg-neutral-50">
                                                    <td className="border border-neutral-200 p-2 font-medium">Book Bank</td>
                                                    <td className="border border-neutral-200 p-1"><select className="w-full bg-transparent p-1 focus:outline-none text-center cursor-pointer" value={hasBookBank} onChange={(e) => setHasBookBank(e.target.value)}><option value="">Select</option><option value="1-Yes">1-Yes</option><option value="2-No">2-No</option></select></td>
                                                    <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1 text-center focus:outline-none" value={bookBankBooks} onChange={(e) => setBookBankBooks(e.target.value)} placeholder="0" disabled={hasBookBank === "2-No"} /></td>
                                                </tr>
                                                <tr className="bg-white hover:bg-neutral-50">
                                                    <td className="border border-neutral-200 p-2 font-medium">Reading Corner</td>
                                                    <td className="border border-neutral-200 p-1"><select className="w-full bg-transparent p-1 focus:outline-none text-center cursor-pointer" value={hasReadingCorner} onChange={(e) => setHasReadingCorner(e.target.value)}><option value="">Select</option><option value="1-Yes">1-Yes</option><option value="2-No">2-No</option></select></td>
                                                    <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1 text-center focus:outline-none" value={readingCornerBooks} onChange={(e) => setReadingCornerBooks(e.target.value)} placeholder="0" disabled={hasReadingCorner === "2-No"} /></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {applicationType === "New Recognition" && hasLibrary === "2-No" && hasBookBank === "2-No" && hasReadingCorner === "2-No" && (
                                        <p className="text-[10px] text-red-600 font-bold bg-red-50 p-2 rounded border border-red-200">
                                            ⛔ Legal Blocker: The school must have at least ONE reading facility (Library, Book Bank, or Reading Corner) as per RTE norms.
                                        </p>
                                    )}

                                    <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-neutral-100">
                                        <div className="space-y-3">
                                            <SelectField label="(b) Does the school have a full-time librarian?" value={hasFullTimeLibrarian} onChange={(e) => setHasFullTimeLibrarian(e.target.value)} options={["1-Yes", "2-No"]} />
                                            {applicationType === "Upgradation" && hasFullTimeLibrarian === "2-No" && (
                                                <p className="text-[10px] text-amber-600 font-bold bg-amber-50 p-2 rounded border border-amber-200">
                                                    ⚠️ Audit Note: A full-time librarian is typically mandatory for Secondary and Higher Secondary levels.
                                                </p>
                                            )}
                                        </div>
                                        <SelectField label="(c) Does the school subscribe to newspapers/magazines?" value={subscribesNewspapers} onChange={(e) => setSubscribesNewspapers(e.target.value)} options={["1-Yes", "2-No"]} />
                                        <div className="space-y-3">
                                            <InputField label="(d) Number of times Library books have been borrowed/read by children" type="number" value={libraryBooksBorrowed} onChange={(e) => setLibraryBooksBorrowed(e.target.value)} placeholder="0" />
                                            {applicationType === "Renewal" && libraryBooksBorrowed === "0" && (
                                                <p className="text-[10px] text-blue-600 font-bold bg-blue-50 p-2 rounded border border-blue-200">
                                                    ℹ️ Quality Indicator: Zero books borrowed signals non-utilization of library resources. Explain in remarks.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 2.12 Detail of School Land Area */}
                                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6 mb-6">
                                    <h4 className="font-semibold text-base text-primary-800 pb-2 border-b border-neutral-100">5.12 Detail of School Land Area</h4>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="flex flex-col space-y-2">
                                                <label className="text-sm font-medium text-neutral-700">(a) Approximate Land Area of the School</label>
                                                <div className="flex gap-2">
                                                    <input type="number" className="flex-1 w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all text-sm outline-none" value={landArea} onChange={(e) => setLandArea(e.target.value)} placeholder="Area Size" />
                                                    <select className="w-1/3 p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all text-sm outline-none cursor-pointer" value={landAreaUnit} onChange={(e) => setLandAreaUnit(e.target.value)}>
                                                        <option value="Square Meter">Square Meter</option><option value="Square Feet">Square Feet</option><option value="Square Yard">Square Yard</option>
                                                    </select>
                                                </div>
                                            </div>
                                            {applicationType === "New Recognition" && (Number(landArea) || 0) < 2000 && landAreaUnit === "Square Meter" && (
                                                <p className="text-[10px] text-red-600 font-bold bg-red-50 p-2 rounded border border-red-200">
                                                    ⛔ Legal Blocker: Ensure area meets State Minimum (e.g., minimum 2000 Sq M for Rural areas).
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <SelectField label="(b) Whether Land is available for expansion of school facilities?" value={hasExpansionLand} onChange={(e) => setHasExpansionLand(e.target.value)} options={["1-Yes", "2-No"]} />
                                            {hasExpansionLand === "1-Yes" && (
                                                <SelectField label="If 1-Yes, whether Horizontal or Vertical?" value={expansionType} onChange={(e) => setExpansionType(e.target.value)} options={["1-Horizontal", "2-Vertical"]} />
                                            )}
                                            <InputField label="(c) Number of Additional Classrooms and Other Rooms required" type="number" value={additionalClassroomsNeeded} onChange={(e) => setAdditionalClassroomsNeeded(e.target.value)} placeholder="0" />
                                            {applicationType === "Upgradation" && hasExpansionLand === "2-No" && (Number(additionalClassroomsNeeded) || 0) > 0 && (
                                                <p className="text-[10px] text-amber-600 font-bold bg-amber-50 p-2 rounded border border-amber-200">
                                                    ⚠️ Scrutiny Required: You need {additionalClassroomsNeeded} rooms but have no expansion land. High risk of overcrowding.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 2.13 Playground */}
                                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6 mb-6">
                                    <h4 className="font-semibold text-base text-primary-800 pb-2 border-b border-neutral-100">5.13 Playground Facilities</h4>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <SelectField label="Whether Playground facility is available in the School?" value={hasPlayground} onChange={(e) => setHasPlayground(e.target.value)} options={["1-Yes", "2-No"]} />

                                        {hasPlayground === "1-Yes" && (
                                            <div className="flex flex-col space-y-2">
                                                <label className="text-sm font-medium text-neutral-700">If 1-Yes then Area of Playground</label>
                                                <div className="flex gap-2">
                                                    <input type="number" className="flex-1 w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all text-sm outline-none" value={playgroundArea} onChange={(e) => setPlaygroundArea(e.target.value)} placeholder="Area Size" />
                                                    <select className="w-1/3 p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all text-sm outline-none cursor-pointer" value={playgroundUnit} onChange={(e) => setPlaygroundUnit(e.target.value)}>
                                                        <option value="Square Meter">Square Meter</option><option value="Square Feet">Square Feet</option><option value="Square Yard">Square Yard</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}
                                        {hasPlayground === "2-No" && (
                                            <div className="md:col-span-2 space-y-3">
                                                <SelectField label="If 2-No, whether school has made adequate arrangements for children to play outdoor games and other physical activities in an adjoining playground/municipal park etc." value={hasAlternatePlayground} onChange={(e) => setHasAlternatePlayground(e.target.value)} options={["1-Yes", "2-No"]} />
                                                {hasAlternatePlayground === "2-No" && (
                                                    <p className="text-[10px] text-red-600 font-bold bg-red-50 p-2 rounded border border-red-200 w-fit">
                                                        ⛔ Critical Blocker: RTE requires physical education infrastructure. You must have your own or a formal arrangement with a nearby park.
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 2.14 Health & Medical Facilities */}
                                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6 mb-6">
                                    <h4 className="font-semibold text-base text-primary-800 pb-2 border-b border-neutral-100">5.14 Health & Medical Facilities</h4>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <SelectField label="(a) Whether Health check-up of students was conducted in previous academic year?" value={hasHealthCheckup} onChange={(e) => setHasHealthCheckup(e.target.value)} options={["1-Yes", "2-No"]} />
                                        {hasHealthCheckup === "1-Yes" && (
                                            <InputField label="Total number of Health check-ups conducted" type="number" value={healthCheckupsCount} onChange={(e) => setHealthCheckupsCount(e.target.value)} placeholder="0" />
                                        )}
                                    </div>

                                    {hasHealthCheckup === "1-Yes" && (
                                        <div className="space-y-3 pt-4 border-t border-neutral-100">
                                            <h5 className="font-medium text-sm text-neutral-700">Health check-up parameters carried out:</h5>
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                                <SelectField label="Height" value={healthParamsHeight} onChange={(e) => setHealthParamsHeight(e.target.value)} options={["1-Yes", "2-No"]} />
                                                <SelectField label="Weight" value={healthParamsWeight} onChange={(e) => setHealthParamsWeight(e.target.value)} options={["1-Yes", "2-No"]} />
                                                <SelectField label="Eyes" value={healthParamsEyes} onChange={(e) => setHealthParamsEyes(e.target.value)} options={["1-Yes", "2-No"]} />
                                                <SelectField label="Dental" value={healthParamsDental} onChange={(e) => setHealthParamsDental(e.target.value)} options={["1-Yes", "2-No"]} />
                                                <SelectField label="Throat" value={healthParamsThroat} onChange={(e) => setHealthParamsThroat(e.target.value)} options={["1-Yes", "2-No"]} />
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-neutral-100">
                                        <SelectField label="(b) De-worming tablets given to children:" value={dewormingTablets} onChange={(e) => setDewormingTablets(e.target.value)} options={["1-Complete (two doses)", "2-Partially (one dose)", "3-Not given"]} />
                                        <SelectField label="(c) Iron and Folic acid tablets given to children as per guidelines of WCD:" value={ironFolicTablets} onChange={(e) => setIronFolicTablets(e.target.value)} options={["1-Yes", "2-No"]} />
                                        <SelectField label="(d) Whether school maintains Annual health records?" value={maintainsHealthRecords} onChange={(e) => setMaintainsHealthRecords(e.target.value)} options={["1-Yes", "2-No"]} />
                                        <SelectField label="(e) Is thermal scanner available in the school?" value={hasThermalScanner} onChange={(e) => setHasThermalScanner(e.target.value)} options={["1-Yes", "2-No"]} />
                                        <div className="space-y-2">
                                            <SelectField label="(f) Is First Aid facility available?" value={hasFirstAid} onChange={(e) => setHasFirstAid(e.target.value)} options={["1-Yes", "2-No"]} />
                                            {applicationType === "Renewal" && hasFirstAid === "2-No" && (
                                                <p className="text-[10px] text-red-600 font-bold bg-red-50 p-2 rounded border border-red-200">
                                                    ❌ Safety Violation: First aid is mandatory for all schools.
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <SelectField label="(g) Is Essential medicines available?" value={hasEssentialMedicines} onChange={(e) => setHasEssentialMedicines(e.target.value)} options={["1-Yes", "2-No"]} />
                                            {applicationType === "Renewal" && hasEssentialMedicines === "2-No" && (
                                                <p className="text-[10px] text-red-600 font-bold bg-red-50 p-2 rounded border border-red-200">
                                                    ❌ Safety Violation: Essential medicines are mandatory.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 2.15 & 2.16 Inclusivity (CWSN) */}
                                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6 mb-6">
                                    <h4 className="font-semibold text-base text-primary-800 pb-2 border-b border-neutral-100">Inclusivity (CWSN Facilities)</h4>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <SelectField label="5.15 Whether Ramp for disabled children to access school building exists?" value={hasRamp} onChange={(e) => setHasRamp(e.target.value)} options={["1-Yes", "2-No"]} />
                                            {applicationType === "New Recognition" && hasRamp === "2-No" && (
                                                <p className="text-[10px] text-red-600 font-bold bg-red-50 p-2 rounded border border-red-200 w-fit">
                                                    ⛔ Legal Blocker: RPWD Act mandates ramps for building access before recognition is granted.
                                                </p>
                                            )}
                                            {hasRamp === "1-Yes" && (
                                                <SelectField label="If 1-Yes, whether Hand-rails for ramp are available?" value={hasHandRails} onChange={(e) => setHasHandRails(e.target.value)} options={["1-Yes", "2-No"]} />
                                            )}
                                        </div>
                                        <div className="space-y-4">
                                            <SelectField label="5.16 Whether School has special educator?" value={hasSpecialEducator} onChange={(e) => setHasSpecialEducator(e.target.value)} options={["1-Dedicated", "2-At cluster level", "3-No"]} />
                                            {hasSpecialEducator === "3-No" && (
                                                <p className="text-[10px] text-blue-600 font-bold bg-blue-50 p-2 rounded border border-blue-200">
                                                    ℹ️ Recommendation: Partner with a 'Cluster Level' educator if a dedicated one isn't feasible to ensure inclusivity.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 2.17 Kitchen & 2.18 Waste Management & 2.19 Furniture */}
                                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6 mb-6">
                                    <h4 className="font-semibold text-base text-primary-800 pb-2 border-b border-neutral-100">General Facilities & Hygiene</h4>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Hide Kitchen logic based on type later, showing for now */}
                                        <div className="space-y-4">
                                            <h5 className="font-medium text-sm text-neutral-700">5.17 Kitchen (PM-POSHAN)</h5>
                                            <SelectField label="(a) Whether Kitchen Garden is available in school?" value={hasKitchenGarden} onChange={(e) => setHasKitchenGarden(e.target.value)} options={["1-Yes", "2-No"]} />
                                            <SelectField label="(b) Whether Kitchen shed is available in school?" value={hasKitchenShed} onChange={(e) => setHasKitchenShed(e.target.value)} options={["1-Yes", "2-No"]} />
                                        </div>

                                        <div className="space-y-4">
                                            <h5 className="font-medium text-sm text-neutral-700">5.18 Dustbins for Waste Collection</h5>
                                            <SelectField label="(a) Each Classroom" value={dustbinsClassroom} onChange={(e) => setDustbinsClassroom(e.target.value)} options={["1-Yes and all", "2-No", "3-Yes but some"]} />
                                            <SelectField label="(b) Toilets" value={dustbinsToilets} onChange={(e) => setDustbinsToilets(e.target.value)} options={["1-Yes and all", "2-No", "3-Yes but some"]} />
                                            <SelectField label="(c) Kitchen" value={dustbinsKitchen} onChange={(e) => setDustbinsKitchen(e.target.value)} options={["1-Yes", "2-No"]} />
                                            {applicationType === "Renewal" && (["2-No", "3-Yes but some"].includes(dustbinsClassroom) || ["2-No", "3-Yes but some"].includes(dustbinsToilets) || dustbinsKitchen === "2-No") && (
                                                <p className="text-[10px] text-red-600 font-bold bg-red-50 p-2 rounded border border-red-200">
                                                    ❌ Hygiene Audit Failure: Proper waste management is required in all specified areas.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-neutral-100 space-y-4">
                                        <h5 className="font-medium text-sm text-neutral-700">5.19 Student Furniture</h5>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <SelectField label="Does the school have furniture for students?" value={hasStudentFurniture} onChange={(e) => setHasStudentFurniture(e.target.value)} options={["1-Yes for all", "2-Partial", "3-No Furniture Available"]} />
                                            {hasStudentFurniture === "3-No Furniture Available" && (
                                                <p className="text-[10px] text-red-600 font-bold bg-red-50 p-2 rounded border border-red-200 h-fit self-end">
                                                    ⛔ Critical Blocker: Adequate furniture is mandatory for school operation.
                                                </p>
                                            )}
                                            {["1-Yes for all", "2-Partial"].includes(hasStudentFurniture) && (
                                                <div className="space-y-2">
                                                    <InputField label="Number of students for whom furniture is available?" type="number" value={furnitureStudentCount} onChange={(e) => setFurnitureStudentCount(e.target.value)} placeholder="0" />
                                                    {applicationType === "Upgradation" && (Number(furnitureStudentCount) || 0) < 100 && furnitureStudentCount !== "" && (
                                                        <p className="text-[10px] text-amber-600 font-bold bg-amber-50 p-2 rounded border border-amber-200">
                                                            ⚠️ Verify: Ensure furniture count accommodates the increased student intake.
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 2.20 Specialized Facilities */}
                                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6 mb-6">
                                    <h4 className="font-semibold text-base text-primary-800 pb-2 border-b border-neutral-100">5.20 Specialized Facilities (Secondary & Higher Secondary)</h4>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <SelectField label="(a) Staff quarters (including residential quarters for Head Teacher/Principal)" value={hasStaffQuarters} onChange={(e) => setHasStaffQuarters(e.target.value)} options={["1-Yes", "2-No"]} />
                                        <div className="space-y-3">
                                            <SelectField label="(b) Tinkering Lab" value={hasTinkeringLab} onChange={(e) => setHasTinkeringLab(e.target.value)} options={["1-Yes", "2-No"]} />
                                            {hasTinkeringLab === "1-Yes" && (
                                                <div className="mt-2 text-sm text-blue-600 bg-blue-50 p-2 rounded border border-blue-200 font-medium space-y-2">
                                                    <p>✅ Found ATL marker. Please provide your ATL ID:</p>
                                                    <input type="text" className="w-full p-2 bg-white border border-blue-300 rounded focus:outline-none" value={atlId} onChange={(e) => setAtlId(e.target.value)} placeholder="Enter ATL ID" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="md:col-span-2 space-y-2 pt-4 border-t border-neutral-100">
                                            <SelectField label="(c) Integrated science laboratory? (where Physics, Chemistry & Bio practicals are held)" value={hasIntegratedScienceLab} onChange={(e) => setHasIntegratedScienceLab(e.target.value)} options={["1-Yes", "2-No"]} />
                                            {applicationType === "Upgradation" && hasIntegratedScienceLab === "2-No" && (
                                                <p className="text-[10px] text-red-600 font-bold bg-red-50 p-2 rounded border border-red-200 w-fit">
                                                    ⛔ Critical Blocker: Mandatory for Secondary Upgradation. You cannot legally offer Classes 9 and 10 without a functional Science lab.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 2.21 Boarding/Hostel Facilities */}
                                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6 mb-6">
                                    <h4 className="font-semibold text-base text-primary-800 pb-2 border-b border-neutral-100">5.21 Boarding/Hostel Facilities Capacity</h4>

                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse border border-neutral-200 text-sm">
                                            <thead>
                                                <tr className="bg-neutral-50 text-neutral-700">
                                                    <th className="border border-neutral-200 p-3 text-left w-1/3">Stage(s) / level(s)</th>
                                                    <th className="border border-neutral-200 p-3 text-center">Availability? (1-Yes/2-No)</th>
                                                    <th className="border border-neutral-200 p-3 text-center">No of Available Seats (Boys)</th>
                                                    <th className="border border-neutral-200 p-3 text-center">No of Available Seats (Girls)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="bg-white hover:bg-neutral-50">
                                                    <td className="border border-neutral-200 p-2 font-medium">Primary</td>
                                                    <td className="border border-neutral-200 p-1"><select className="w-full bg-transparent p-1 focus:outline-none text-center cursor-pointer" value={hostelPrimaryAvailability} onChange={(e) => setHostelPrimaryAvailability(e.target.value)}><option value="">Select</option><option value="1-Yes">1-Yes</option><option value="2-No">2-No</option></select></td>
                                                    <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1 text-center focus:outline-none" value={hostelPrimaryBoys} onChange={(e) => setHostelPrimaryBoys(e.target.value)} placeholder="0" disabled={hostelPrimaryAvailability !== "1-Yes"} /></td>
                                                    <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1 text-center focus:outline-none" value={hostelPrimaryGirls} onChange={(e) => setHostelPrimaryGirls(e.target.value)} placeholder="0" disabled={hostelPrimaryAvailability !== "1-Yes"} /></td>
                                                </tr>
                                                <tr className="bg-white hover:bg-neutral-50">
                                                    <td className="border border-neutral-200 p-2 font-medium">Upper Primary</td>
                                                    <td className="border border-neutral-200 p-1"><select className="w-full bg-transparent p-1 focus:outline-none text-center cursor-pointer" value={hostelUpperPrimaryAvailability} onChange={(e) => setHostelUpperPrimaryAvailability(e.target.value)}><option value="">Select</option><option value="1-Yes">1-Yes</option><option value="2-No">2-No</option></select></td>
                                                    <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1 text-center focus:outline-none" value={hostelUpperPrimaryBoys} onChange={(e) => setHostelUpperPrimaryBoys(e.target.value)} placeholder="0" disabled={hostelUpperPrimaryAvailability !== "1-Yes"} /></td>
                                                    <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1 text-center focus:outline-none" value={hostelUpperPrimaryGirls} onChange={(e) => setHostelUpperPrimaryGirls(e.target.value)} placeholder="0" disabled={hostelUpperPrimaryAvailability !== "1-Yes"} /></td>
                                                </tr>
                                                <tr className="bg-white hover:bg-neutral-50">
                                                    <td className="border border-neutral-200 p-2 font-medium">Secondary</td>
                                                    <td className="border border-neutral-200 p-1"><select className="w-full bg-transparent p-1 focus:outline-none text-center cursor-pointer" value={hostelSecondaryAvailability} onChange={(e) => setHostelSecondaryAvailability(e.target.value)}><option value="">Select</option><option value="1-Yes">1-Yes</option><option value="2-No">2-No</option></select></td>
                                                    <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1 text-center focus:outline-none" value={hostelSecondaryBoys} onChange={(e) => setHostelSecondaryBoys(e.target.value)} placeholder="0" disabled={hostelSecondaryAvailability !== "1-Yes"} /></td>
                                                    <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1 text-center focus:outline-none" value={hostelSecondaryGirls} onChange={(e) => setHostelSecondaryGirls(e.target.value)} placeholder="0" disabled={hostelSecondaryAvailability !== "1-Yes"} /></td>
                                                </tr>
                                                <tr className="bg-white hover:bg-neutral-50">
                                                    <td className="border border-neutral-200 p-2 font-medium">Higher Secondary</td>
                                                    <td className="border border-neutral-200 p-1"><select className="w-full bg-transparent p-1 focus:outline-none text-center cursor-pointer" value={hostelHigherSecondaryAvailability} onChange={(e) => setHostelHigherSecondaryAvailability(e.target.value)}><option value="">Select</option><option value="1-Yes">1-Yes</option><option value="2-No">2-No</option></select></td>
                                                    <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1 text-center focus:outline-none" value={hostelHigherSecondaryBoys} onChange={(e) => setHostelHigherSecondaryBoys(e.target.value)} placeholder="0" disabled={hostelHigherSecondaryAvailability !== "1-Yes"} /></td>
                                                    <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1 text-center focus:outline-none" value={hostelHigherSecondaryGirls} onChange={(e) => setHostelHigherSecondaryGirls(e.target.value)} placeholder="0" disabled={hostelHigherSecondaryAvailability !== "1-Yes"} /></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {isResidentialCapacity && (
                                        <div className="mt-4 bg-blue-50 p-4 border border-blue-200 rounded-xl space-y-4">
                                            <h5 className="font-semibold text-sm text-blue-800 flex items-center gap-2">
                                                <FiShield /> Hostel Safety Compliance (Residential Capability Detected)
                                            </h5>
                                            <p className="text-xs text-blue-600">Operating a hostel requires separate safety certificates. Provide details regarding Warden and FSSAI.</p>

                                            <div className="grid md:grid-cols-3 gap-4">
                                                <UploadField label="Hostel Fire Safety Cert." />
                                                <UploadField label="Food Safety (FSSAI) License" />
                                                <UploadField label="Warden Details / Identity" />
                                            </div>

                                            {applicationType === "New Recognition" && (
                                                <p className="text-[10px] text-red-600 font-bold bg-white p-2 rounded border border-red-200">
                                                    ⚠️ Verification Notice: Since you claim residential capacity, these documents must be physically verified before New Recognition approval is granted.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* 2.22 Laboratories (Higher Secondary) */}
                                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6 mb-6">
                                    <div className="pb-2 border-b border-neutral-100 flex flex-col md:flex-row md:justify-between md:items-end gap-2">
                                        <h4 className="font-semibold text-base text-primary-800">5.22 Dedicated Laboratories</h4>
                                        <span className="text-xs font-bold px-2 py-1 bg-neutral-100 text-neutral-600 rounded">For Higher Secondary sections only</span>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse border border-neutral-200 text-sm">
                                            <thead>
                                                <tr className="bg-neutral-50 text-neutral-700">
                                                    <th className="border border-neutral-200 p-3 text-left w-1/4">Laboratories</th>
                                                    <th className="border border-neutral-200 p-3 text-center w-1/2">Availability with Present Condition</th>
                                                    <th className="border border-neutral-200 p-3 text-center w-1/4">Separate Room Available?</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {higherSecondaryLabs.map((lab, index) => (
                                                    <tr key={index} className="bg-white hover:bg-neutral-50">
                                                        <td className="border border-neutral-200 p-2 font-medium">{lab.name}</td>
                                                        <td className="border border-neutral-200 p-1">
                                                            <select
                                                                className="w-full bg-transparent p-1 focus:outline-none text-center cursor-pointer"
                                                                value={lab.availability}
                                                                onChange={(e) => handleLabChange(index, "availability", e.target.value)}
                                                            >
                                                                <option value="">Select</option>
                                                                <option value="1-Fully Equipped">1-Fully Equipped</option>
                                                                <option value="2-Partially Equipped">2-Partially Equipped</option>
                                                                <option value="3-Not Equipped">3-Not Equipped</option>
                                                                <option value="4-Lab Not Available">4-Lab Not Available</option>
                                                            </select>
                                                        </td>
                                                        <td className="border border-neutral-200 p-1">
                                                            <select
                                                                className="w-full bg-transparent p-1 focus:outline-none text-center cursor-pointer"
                                                                value={lab.separateRoom}
                                                                onChange={(e) => handleLabChange(index, "separateRoom", e.target.value)}
                                                                disabled={lab.availability === "4-Lab Not Available"}
                                                            >
                                                                <option value="">Select</option>
                                                                <option value="1-Yes">1-Yes</option>
                                                                <option value="2-No">2-No</option>
                                                            </select>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {applicationType === "Upgradation" &&
                                        (higherSecondaryLabs[0].availability === "4-Lab Not Available" ||
                                            higherSecondaryLabs[1].availability === "4-Lab Not Available" ||
                                            higherSecondaryLabs[2].availability === "4-Lab Not Available") && (
                                            <p className="text-[10px] text-red-600 font-bold bg-red-50 p-2 rounded border border-red-200">
                                                ⛔ Critical Blocker: Upgradation to Science Stream requires Physics, Chemistry, and Biology labs to exist. Fully equipped status with separate rooms is mandatory for approval.
                                            </p>
                                        )}
                                </div>

                                {/* 2.23 General Equipment */}
                                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6 mb-6">
                                    <h4 className="font-semibold text-base text-primary-800 pb-2 border-b border-neutral-100">5.23 General Equipment(s)</h4>

                                    <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
                                        <SelectField label="(a) Audio/Visual/Public Address System" value={equipAudioVisual} onChange={(e) => setEquipAudioVisual(e.target.value)} options={["1-Yes", "2-No", "3-Yes but not Functional"]} />
                                        <div className="space-y-2">
                                            <SelectField label="(d) Biometric device" value={equipBiometric} onChange={(e) => setEquipBiometric(e.target.value)} options={["1-Yes", "2-No", "3-Yes but not Functional"]} />
                                            {equipBiometric === "1-Yes" && (
                                                <p className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded">
                                                    ✅ Digital Readiness: Ensure this aligns with your Teacher Attendance capture method.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-neutral-100 grid md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <SelectField label="(b) Science Kit" value={equipScienceKit} onChange={(e) => setEquipScienceKit(e.target.value)} options={["1-Yes", "2-No", "3-Yes but not Functional"]} />
                                            {applicationType === "New Recognition" && equipScienceKit === "2-No" && (
                                                <p className="text-[10px] text-amber-600 font-bold bg-amber-50 p-2 rounded border border-amber-200">
                                                    ⚠️ Quality Gap: RTE specifies basic science kits as essential for Classes 6-10.
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            <SelectField label="(c) Math's Kit" value={equipMathKit} onChange={(e) => setEquipMathKit(e.target.value)} options={["1-Yes", "2-No", "3-Yes but not Functional"]} />
                                            {applicationType === "New Recognition" && equipMathKit === "2-No" && (
                                                <p className="text-[10px] text-amber-600 font-bold bg-amber-50 p-2 rounded border border-amber-200">
                                                    ⚠️ Quality Gap: RTE specifies basic math kits as essential for Classes 6-10.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-xs text-neutral-500 italic mt-2">
                                        * Science Kit: general items, chemicals, glassware, microscope, electroscope, multimeter, etc. <br />
                                        ** Math's Kit: cubes, cutouts, geoboard, abacus, algebraic tiles, etc.
                                    </p>
                                </div>

                                {/* PART B: Computers and Digital Initiatives */}
                                <div className="space-y-8 pt-8 border-t-2 border-primary-100">
                                    <h3 className="text-xl font-bold text-primary-900 mb-4">PART B: Computers and Digital Initiatives</h3>

                                    {/* 2.24 Computer or Digital Equipment Status */}
                                    <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6 mb-6">
                                        <h4 className="font-semibold text-base text-primary-800 pb-2 border-b border-neutral-100">5.24 Computer or Digital Equipment Status</h4>
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse border border-neutral-200 text-sm">
                                                <thead>
                                                    <tr className="bg-neutral-50 text-neutral-700">
                                                        <th className="border border-neutral-200 p-3 text-left">Items</th>
                                                        <th className="border border-neutral-200 p-3 text-center w-48">Total Number of Functional units available</th>
                                                        <th className="border border-neutral-200 p-3 text-center w-56">Number of Functional Units for pedagogical purpose (Out of Total)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {digitalEquipItems.map((item, index) => (
                                                        <tr key={index} className="bg-white hover:bg-neutral-50">
                                                            <td className="border border-neutral-200 p-2 font-medium">{item.name}</td>
                                                            <td className="border border-neutral-200 p-1">
                                                                <input
                                                                    type="number"
                                                                    className="w-full bg-transparent p-1 text-center focus:outline-none"
                                                                    value={item.total}
                                                                    onChange={(e) => {
                                                                        const newItems = [...digitalEquipItems];
                                                                        newItems[index].total = e.target.value;
                                                                        setDigitalEquipItems(newItems);
                                                                    }}
                                                                    placeholder="0"
                                                                />
                                                            </td>
                                                            <td className="border border-neutral-200 p-1">
                                                                <input
                                                                    type="number"
                                                                    className="w-full bg-transparent p-1 text-center focus:outline-none"
                                                                    value={item.pedagogical}
                                                                    onChange={(e) => {
                                                                        const newItems = [...digitalEquipItems];
                                                                        newItems[index].pedagogical = e.target.value;
                                                                        setDigitalEquipItems(newItems);
                                                                    }}
                                                                    placeholder="0"
                                                                />
                                                                {Number(item.pedagogical) > Number(item.total) && (
                                                                    <p className="text-[10px] text-red-600 font-bold mt-1 text-center">Pedagogical units cannot exceed total</p>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        {applicationType === "New Recognition" && (
                                            <p className="text-xs text-blue-600 italic bg-blue-50 p-2 rounded border border-blue-200">ℹ️ Proposed Inventory: List the equipment you have purchased or plan to buy for the initial operational year.</p>
                                        )}
                                        {applicationType === "Upgradation" && /Secondary|Higher|SEC|HSEC/.test(schoolCategory) &&
                                            digitalEquipItems.slice(0, 6).every(item => (Number(item.pedagogical) || 0) < 5) && (
                                                <p className="text-[10px] text-amber-600 font-bold bg-amber-50 p-2 rounded border border-amber-200">
                                                    ⚠️ High Priority: Secondary levels typically require a significant number of functional units for pedagogical purposes.
                                                </p>
                                            )}
                                        {hasIctLab === "1-Yes" && digitalEquipItems[13].total === "" && (
                                            <p className="text-[10px] text-red-600 font-bold bg-red-50 p-2 rounded border border-red-200">
                                                ⛔ Critical: Power Backup (5.24.n) is mandatory if the school has a Computer Lab.
                                            </p>
                                        )}
                                    </div>

                                    {/* 2.25 ICT Lab */}
                                    <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6 mb-6">
                                        <h4 className="font-semibold text-base text-primary-800 pb-2 border-b border-neutral-100">5.25 Computer/ICT Lab Availability</h4>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <SelectField
                                                    label="Is Computer/ICT Lab available in school?"
                                                    value={hasIctLab}
                                                    onChange={(e) => setHasIctLab(e.target.value)}
                                                    options={["1-Yes", "2-No"]}
                                                />
                                                {/Secondary|Higher|Upper Primary|UPR|SEC|HSEC/.test(schoolCategory) && hasIctLab === "2-No" && (
                                                    <p className="text-[10px] text-red-600 font-bold bg-red-50 p-2 rounded border border-red-200">
                                                        ⛔ Legal Blocker: Mandatory for Classes 6 and above. Recognition will be blocked until a plan is provided.
                                                    </p>
                                                )}
                                                {hasIctLab === "1-Yes" && (
                                                    <div className="space-y-4 pt-4 border-t border-neutral-100 animate-in fade-in slide-in-from-top-2">
                                                        <InputField label="(a)(i) Number of ICT Labs Available" type="number" value={ictLabsCount} onChange={(e) => setIctLabsCount(e.target.value)} placeholder="0" />
                                                        <InputField label="(a)(ii) Number of Total Functional Desktops/Laptops in all ICT labs" type="number" value={totalFunctionalIctDevices} onChange={(e) => setTotalFunctionalIctDevices(e.target.value)} placeholder="0" />
                                                        <SelectField label="(a)(iii) Is Separate Room(s) Available for Computer/ICT lab?" value={hasSeparateIctLabRoom} onChange={(e) => setHasSeparateIctLabRoom(e.target.value)} options={["1-Yes", "2-No"]} />
                                                        {applicationType === "Upgradation" && hasSeparateIctLabRoom === "2-No" && (
                                                            <p className="text-[10px] text-red-600 font-bold bg-red-50 p-2 rounded border border-red-200">
                                                                ⛔ Critical: Separate room is mandatory for Secondary Upgradation recognition.
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* 2.25(b) Samagra Shiksha - Hide for Private schools */}
                                            {managementGroup !== "C- Private Unaided" && hasIctLab === "1-Yes" && (
                                                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-4 animate-in fade-in">
                                                    <h5 className="font-bold text-xs text-neutral-700 uppercase tracking-wider">5.25(b) ICT Lab under Samagra Shiksha (Govt/Aided Only)</h5>
                                                    <SelectField label="Is the ICT Lab available under Samagra Shiksha?" value={hasSamagraIctLab} onChange={(e) => setHasSamagraIctLab(e.target.value)} options={["1-Yes", "2-No"]} />
                                                    {hasSamagraIctLab === "1-Yes" && (
                                                        <div className="space-y-3 pt-2">
                                                            <InputField label="Year of implementation" value={samagraIctYear} onChange={(e) => setSamagraIctYear(e.target.value)} placeholder="e.g. 2023" />
                                                            <SelectField label="Whether the ICT Lab is functional?" value={isSamagraIctFunctional} onChange={(e) => setIsSamagraIctFunctional(e.target.value)} options={["1-Yes", "2-No"]} />
                                                            <SelectField label="Which model is implemented?" value={samagraIctModel} onChange={(e) => setSamagraIctModel(e.target.value)} options={["1-BOOT Model", "2-BOO Model", "3-Others"]} />
                                                            <SelectField label="Type of the ICT Instructor" value={samagraIctInstructorType} onChange={(e) => setSamagraIctInstructorType(e.target.value)} options={["1-Full Time", "2-Part Time", "3-Not Available"]} />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 2.26 Internet Facility */}
                                    <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6 mb-6">
                                        <h4 className="font-semibold text-base text-primary-800 pb-2 border-b border-neutral-100">5.26 Internet Facility</h4>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <SelectField label="Does the School have Internet Facility?" value={hasInternet} onChange={(e) => setHasInternet(e.target.value)} options={["1-Yes", "2-No"]} />
                                                {applicationType === "Upgradation" && /Secondary|Higher|SEC|HSEC/.test(schoolCategory) && hasInternet === "2-No" && (
                                                    <p className="text-[10px] text-red-600 font-bold bg-red-50 p-2 rounded border border-red-200">
                                                        ⛔ Digital Requirement Warning: Internet is practically mandatory for secondary school recognition.
                                                    </p>
                                                )}
                                                {hasInternet === "1-Yes" && (
                                                    <div className="pt-4 space-y-4 border-t border-neutral-100 animate-in fade-in">
                                                        <SelectField
                                                            label="(a) Type of internet facility available in the school"
                                                            value={internetType}
                                                            onChange={(e) => setInternetType(e.target.value)}
                                                            options={["1-Broadband/Leased Line", "2-USB Modem/dongle/Portable Hotspot", "3-Telephone line with modem", "4-Mobile phone Internet", "5-Any Other type of connection", "6-VSAT"]}
                                                        />
                                                        {["1-Broadband/Leased Line", "6-VSAT"].includes(internetType) ? (
                                                            <p className="text-[10px] text-emerald-600 font-bold bg-emerald-50 p-2 rounded border border-emerald-200">✅ High Reliability: This connection type improves modernization score.</p>
                                                        ) : internetType === "4-Mobile phone Internet" ? (
                                                            <p className="text-[10px] text-amber-600 font-bold bg-amber-50 p-2 rounded border border-amber-200">⚠️ Low Reliability Score: Upgrade to Broadband/VSAT for better affiliation ranking.</p>
                                                        ) : null}
                                                        <SelectField label="(b) Is access to internet facility used for pedagogical purpose?" value={internetPedagogical} onChange={(e) => setInternetPedagogical(e.target.value)} options={["1-Yes", "2-No"]} />
                                                        {internetPedagogical === "2-No" && (
                                                            <p className="text-[10px] text-blue-600 font-bold italic">Note: Using internet for teaching is a key quality indicator for recognition.</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2.27 Digital Teaching Tools */}
                                    <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6 mb-6">
                                        <h4 className="font-semibold text-base text-primary-800 pb-2 border-b border-neutral-100">5.27 Digital Teaching Tools & Content</h4>
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse border border-neutral-200 text-sm">
                                                <thead>
                                                    <tr className="bg-neutral-50 text-neutral-700">
                                                        <th className="border border-neutral-200 p-3 text-left">Equipment/Facility</th>
                                                        <th className="border border-neutral-200 p-3 text-center w-56">Availability (1-Yes / 2-No)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {digitalTeachingTools.map((tool, index) => (
                                                        <tr key={index} className="bg-white hover:bg-neutral-50">
                                                            <td className="border border-neutral-200 p-2 font-medium">{tool.name}</td>
                                                            <td className="border border-neutral-200 p-1">
                                                                <select
                                                                    className="w-full bg-transparent p-1 focus:outline-none text-center cursor-pointer"
                                                                    value={tool.availability}
                                                                    onChange={(e) => {
                                                                        const newTools = [...digitalTeachingTools];
                                                                        newTools[index].availability = e.target.value;
                                                                        setDigitalTeachingTools(newTools);
                                                                    }}
                                                                >
                                                                    <option value="">Select</option>
                                                                    <option value="1-Yes">1-Yes</option>
                                                                    <option value="2-No">2-No</option>
                                                                </select>
                                                                {index === 2 && tool.availability === "1-Yes" && (
                                                                    <p className="text-[10px] text-emerald-600 font-bold mt-1 text-center">⭐ Strong Compliance: Aligning with RPWD Act assistive tech norms.</p>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* 2.28 Digital Library */}
                                    <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6 mb-6">
                                        <h4 className="font-semibold text-base text-primary-800 pb-2 border-b border-neutral-100">5.28 Digital Library</h4>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <SelectField label="Does the School have Digital Library?" value={hasDigitalLibrary} onChange={(e) => setHasDigitalLibrary(e.target.value)} options={["1-Yes", "2-No"]} />
                                                {hasDigitalLibrary === "1-Yes" && (
                                                    <div className="pt-4 animate-in fade-in">
                                                        <InputField label="Number of e-Books/e-Contents available" type="number" value={digitalLibraryBooks} onChange={(e) => setDigitalLibraryBooks(e.target.value)} placeholder="0" />
                                                        {Number(digitalLibraryBooks) <= 0 && digitalLibraryBooks !== "" && (
                                                            <p className="text-[10px] text-red-600 font-bold mt-1 text-center bg-red-50 p-1 rounded">E-books count must be greater than zero if digital library exists.</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    )
                }

                {/* Step 5: Staff */}
                {
                    currentStep === 5 && (
                        <div className="space-y-8">
                            {/* 3. Staffs In-Position */}
                            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
                                <h3 className="text-lg font-semibold text-neutral-800 pb-2 border-b border-neutral-100 flex items-center justify-between">
                                    Section 6: Teaching and Non-Teaching Staffs
                                </h3>
                                <p className="text-sm text-neutral-500">Number of STAFFS (Teaching / Non-Teaching / Administrative Staffs) In-position:</p>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse border border-neutral-200 text-sm">
                                        <thead>
                                            <tr className="bg-neutral-50 text-neutral-700">
                                                <th className="border border-neutral-200 p-3 text-left">Staffs in-position</th>
                                                <th className="border border-neutral-200 p-3 text-center w-48">Total Number of Staffs</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="bg-white">
                                                <td className="border border-neutral-200 p-2 font-medium">(a) REGULAR TEACHING STAFFS</td>
                                                <td className="border border-neutral-200 p-1">
                                                    <input type="number" className="w-full bg-transparent p-1.5 focus:outline-none text-center" value={staffCounts.regular} onChange={(e) => setStaffCounts({ ...staffCounts, regular: e.target.value })} placeholder="0" />
                                                </td>
                                            </tr>
                                            <tr className="bg-white">
                                                <td className="border border-neutral-200 p-2 font-medium">(b) NON-REGULAR TEACHING STAFFS (Contract, Part Time, Guest etc.)</td>
                                                <td className="border border-neutral-200 p-1">
                                                    <input type="number" className="w-full bg-transparent p-1.5 focus:outline-none text-center" value={staffCounts.nonRegular} onChange={(e) => setStaffCounts({ ...staffCounts, nonRegular: e.target.value })} placeholder="0" />
                                                </td>
                                            </tr>
                                            <tr className="bg-neutral-50 font-bold">
                                                <td className="border border-neutral-200 p-2">Total Teaching Staff in Position [(a)+(b)]</td>
                                                <td className="border border-neutral-200 p-2 text-center text-primary-700">
                                                    {(Number(staffCounts.regular) || 0) + (Number(staffCounts.nonRegular) || 0)}
                                                </td>
                                            </tr>
                                            <tr className="bg-white">
                                                <td className="border border-neutral-200 p-2 font-medium">(c) NON-TEACHING STAFFS</td>
                                                <td className="border border-neutral-200 p-2">
                                                    <input type="number" className="w-full bg-transparent p-1.5 focus:outline-none text-center" value={staffCounts.nonTeaching} onChange={(e) => setStaffCounts({ ...staffCounts, nonTeaching: e.target.value })} placeholder="0" />
                                                </td>
                                            </tr>
                                            <tr className="bg-white">
                                                <td className="border border-neutral-200 p-2 font-medium">(d) Resource Persons for VOCATIONAL/NSQF Courses</td>
                                                <td className="border border-neutral-200 p-2">
                                                    <input type="number" className="w-full bg-transparent p-1.5 focus:outline-none text-center" value={staffCounts.vocational} onChange={(e) => setStaffCounts({ ...staffCounts, vocational: e.target.value })} placeholder="0" />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                {Number(staffCounts.nonRegular) > (Number(staffCounts.regular) + Number(staffCounts.nonRegular)) * 0.5 && (
                                    <p className="text-[10px] text-amber-600 font-bold bg-amber-50 p-2 rounded border border-amber-200">
                                        ⚠️ Alert: High proportion of non-regular staff detected. Government norms prioritize regular teaching staff for stable recognition.
                                    </p>
                                )}
                            </div>

                            {/* 3.1 Staff Required */}
                            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
                                <h3 className="text-lg font-semibold text-neutral-800 pb-2 border-b border-neutral-100">6.1 Number of Teaching Staffs Required:</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse border border-neutral-200 text-sm">
                                        <thead>
                                            <tr className="bg-neutral-50 text-neutral-700 uppercase text-[10px] tracking-wider">
                                                <th className="border border-neutral-200 p-3 text-center">Pre-Primary</th>
                                                <th className="border border-neutral-200 p-3 text-center">Primary</th>
                                                <th className="border border-neutral-200 p-3 text-center">Upper Primary</th>
                                                <th className="border border-neutral-200 p-3 text-center">Secondary</th>
                                                <th className="border border-neutral-200 p-3 text-center">Higher Secondary</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="bg-white">
                                                <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1.5 focus:outline-none text-center" value={staffRequired.prePrimary} onChange={(e) => setStaffRequired({ ...staffRequired, prePrimary: e.target.value })} placeholder="0" /></td>
                                                <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1.5 focus:outline-none text-center" value={staffRequired.primary} onChange={(e) => setStaffRequired({ ...staffRequired, primary: e.target.value })} placeholder="0" /></td>
                                                <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1.5 focus:outline-none text-center" value={staffRequired.upperPrimary} onChange={(e) => setStaffRequired({ ...staffRequired, upperPrimary: e.target.value })} placeholder="0" /></td>
                                                <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1.5 focus:outline-none text-center" value={staffRequired.secondary} onChange={(e) => setStaffRequired({ ...staffRequired, secondary: e.target.value })} placeholder="0" /></td>
                                                <td className="border border-neutral-200 p-1"><input type="number" className="w-full bg-transparent p-1.5 focus:outline-none text-center" value={staffRequired.higherSecondary} onChange={(e) => setStaffRequired({ ...staffRequired, higherSecondary: e.target.value })} placeholder="0" /></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Staff Management Sub-Tabs */}
                            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-neutral-100">
                                    <div className="flex bg-neutral-100 p-1 rounded-xl w-fit">
                                        <button
                                            onClick={() => setActiveStaffTab("teaching")}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeStaffTab === "teaching" ? "bg-white text-primary-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
                                        >
                                            6.2 Teaching Staff
                                        </button>
                                        <button
                                            onClick={() => setActiveStaffTab("non-teaching")}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeStaffTab === "non-teaching" ? "bg-white text-primary-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
                                        >
                                            6.3 Non-Teaching
                                        </button>
                                        {isVocational === "1-Yes" && (
                                            <button
                                                onClick={() => setActiveStaffTab("vocational")}
                                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeStaffTab === "vocational" ? "bg-white text-primary-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
                                            >
                                                6.4 Vocational
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {activeStaffTab === "teaching" && !isAddingTeacher && (
                                            <button
                                                onClick={() => { setEditingTeacherId(null); setIsAddingTeacher(true); }}
                                                className="px-4 py-2 bg-primary-600 text-white rounded-xl text-[10px] font-bold hover:bg-primary-700 transition-all flex items-center gap-2"
                                            >
                                                + Add Teacher
                                            </button>
                                        )}
                                        {activeStaffTab === "non-teaching" && !isAddingNonTeaching && (
                                            <button
                                                onClick={() => { setEditingNonTeachingId(null); setIsAddingNonTeaching(true); }}
                                                className="px-4 py-2 bg-primary-600 text-white rounded-xl text-[10px] font-bold hover:bg-primary-700 transition-all flex items-center gap-2"
                                            >
                                                + Add Staff
                                            </button>
                                        )}
                                        {activeStaffTab === "vocational" && !isAddingVocational && (
                                            <button
                                                onClick={() => { setEditingVocationalId(null); setIsAddingVocational(true); }}
                                                className="px-4 py-2 bg-primary-600 text-white rounded-xl text-[10px] font-bold hover:bg-primary-700 transition-all flex items-center gap-2"
                                            >
                                                + Add Resource Person
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {activeStaffTab === "teaching" && (
                                    <div className="space-y-6">
                                        {!isAddingTeacher ? (
                                            <div className="space-y-6">
                                                {/* Dashboard Alerts */}
                                                <div className="space-y-2">
                                                    {/* 1. Level vs Highest Class check */}
                                                    {Number(highestClass) >= 10 && !teachers.some(t => t.appointedLevel === "2-TGT/Trained Graduate Teacher" || t.appointedLevel === "4-Head Master/Principal") && (
                                                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                                                            <FiShield className="text-red-600 shrink-0" />
                                                            <p className="text-xs font-bold text-red-700">
                                                                CRITICAL: Secondary Upgradation requires at least one TGT (Trained Graduate Teacher) or Principal.
                                                            </p>
                                                        </div>
                                                    )}
                                                    {Number(highestClass) >= 12 && !teachers.some(t => t.appointedLevel === "3-PGT/Post Graduate Teacher") && (
                                                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                                                            <FiShield className="text-red-600 shrink-0" />
                                                            <p className="text-xs font-bold text-red-700">
                                                                CRITICAL: Higher Secondary requires at least one PGT (Post Graduate Teacher).
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* 3. Digital Skills Warning (Secondary Upgradation) */}
                                                    {applicationType === "upgradation" && teachers.length > 0 && teachers.filter(t => t.isCapableDigital === "1-Yes").length / teachers.length < 0.5 && (
                                                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                                                            <FiShield className="text-amber-600 shrink-0" />
                                                            <p className="text-[10px] font-bold text-amber-700">
                                                                TRAINING GAP: Less than 50% staff are capable of handling digital devices. This may hinder Secondary Upgradation approval.
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* 4. Safety Training Check (Renewal) */}
                                                    {applicationType === "renewal" && teachers.filter(t => t.trainedSafety === "1-Yes").length < 2 && (
                                                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-700">
                                                            <FiShield className="shrink-0" />
                                                            <p className="text-[10px] font-bold">
                                                                COMPLIANCE: Renewal requires at least 2 teachers trained in School Safety Audits (6.2.27).
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* 5. CWSN Strength Recognition */}
                                                    {teachers.length > 0 && teachers.filter(t => t.trainedCWSN === "1-Yes").length / teachers.length >= 0.3 && (
                                                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700">
                                                            <div className="bg-emerald-100 p-1.5 rounded-lg">
                                                                <FiCheck className="text-emerald-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold uppercase tracking-tight">Resource Strength</p>
                                                                <p className="text-[10px] font-medium opacity-80">Inclusive Readiness: High percentage of staff trained for CWSN.</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* 2. Core Subject Coverage Guard (for Class 6+) */}
                                                    {Number(highestClass) >= 8 && teachers.length > 0 && (
                                                        <div className="p-4 bg-white border border-neutral-200 rounded-2xl shadow-sm">
                                                            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Core Subject Coverage Audit</h4>
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                                {[
                                                                    { name: "Mathematics", key: "3-Mathematics" },
                                                                    { name: "Science", key: "7-Science" },
                                                                    { name: "English", key: "46-English" },
                                                                    { name: "Social Science", key: "8-Social Studies" }
                                                                ].map(subj => {
                                                                    const isCovered = teachers.some(t => t.appointedForSubject === subj.key || t.mainSubject1 === subj.key || t.mainSubject2 === subj.key);
                                                                    return (
                                                                        <div key={subj.key} className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center gap-1 ${isCovered ? "bg-emerald-50 border-emerald-100" : "bg-amber-50 border-amber-100"}`}>
                                                                            <span className={`text-[10px] font-bold ${isCovered ? "text-emerald-700" : "text-amber-700"}`}>{subj.name}</span>
                                                                            <span className="text-[9px] font-semibold">{isCovered ? "✅ Assigned" : "⚠️ Missing"}</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                {teachers.length === 0 ? (
                                                    <div className="p-12 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                                                        <p className="text-neutral-400 text-sm">No teachers added yet. Click &quot;Add New Teacher&quot; to begin.</p>
                                                    </div>
                                                ) : (
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full border-collapse text-sm">
                                                            <thead>
                                                                <tr className="text-neutral-500 border-b border-neutral-100">
                                                                    <th className="p-3 text-left font-semibold">Teacher Name</th>
                                                                    <th className="p-3 text-left font-semibold">Type</th>
                                                                    <th className="p-3 text-left font-semibold">Level</th>
                                                                    <th className="p-3 text-left font-semibold">Qual.</th>
                                                                    <th className="p-3 text-center font-semibold">Action</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-neutral-50">
                                                                {teachers.map((t) => {
                                                                    const isElementary = t.appointedLevel === "1-PRT/Primary Teacher" || t.appointedLevel === "2-TGT/Trained Graduate Teacher";
                                                                    const isTETMissing = isElementary && t.isTETQualified === "2-No";

                                                                    return (
                                                                        <tr key={t.id} className="hover:bg-neutral-50 transition-colors">
                                                                            <td className="p-3">
                                                                                <div className="font-medium text-neutral-800">{t.name}</div>
                                                                                {isTETMissing && <div className="text-[9px] text-red-500 font-bold uppercase">⚠️ Missing TET (RTE Violation)</div>}
                                                                            </td>
                                                                            <td className="p-3 text-neutral-600 truncate max-w-[120px]">{t.teacherType}</td>
                                                                            <td className="p-3 text-neutral-600 truncate max-w-[120px]">{t.appointedLevel}</td>
                                                                            <td className="p-3">
                                                                                <div className="flex flex-col gap-1">
                                                                                    {t.professionalQual === "6-None" ? (
                                                                                        <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[9px] font-bold text-center">Unqualified</span>
                                                                                    ) : (
                                                                                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full text-[9px] font-bold text-center">Qualified</span>
                                                                                    )}
                                                                                    {t.isTETQualified === "1-Yes" && (
                                                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-[9px] font-bold text-center">TET Pass</span>
                                                                                    )}
                                                                                </div>
                                                                            </td>
                                                                            <td className="p-3 text-center flex items-center justify-center gap-4">
                                                                                <button
                                                                                    onClick={() => {
                                                                                        setCurrentTeacher(t);
                                                                                        setEditingTeacherId(t.id);
                                                                                        setIsAddingTeacher(true);
                                                                                    }}
                                                                                    className="text-primary-600 hover:text-primary-800 font-bold text-xs transition-colors"
                                                                                >
                                                                                    Edit
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => handleDeleteTeacher(t.id)}
                                                                                    className="text-red-500 hover:text-red-700 font-bold text-xs transition-colors"
                                                                                >
                                                                                    Delete
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (

                                            <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-8 p-6 bg-neutral-50 rounded-2xl border border-neutral-200">
                                                <div className="grid md:grid-cols-2 gap-5">
                                                    <InputField label="6.2.1 Teacher Name (in Capital Letter)" value={currentTeacher.name} onChange={(e) => setCurrentTeacher({ ...currentTeacher, name: e.target.value.toUpperCase() })} placeholder="FULL NAME" />
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <InputField label="6.2.8 (a) Mobile" type="tel" value={currentTeacher.mobile} onChange={(e) => setCurrentTeacher({ ...currentTeacher, mobile: e.target.value })} placeholder="10-digit mobile" />
                                                        <InputField label="6.2.8 (b) Email" type="email" value={currentTeacher.email} onChange={(e) => setCurrentTeacher({ ...currentTeacher, email: e.target.value })} placeholder="email@school.com" />
                                                    </div>
                                                    <SelectField label="6.2.2 Gender" value={currentTeacher.gender} onChange={(e) => setCurrentTeacher({ ...currentTeacher, gender: e.target.value })} options={["1-Male", "2-Female", "3-Transgender"]} />
                                                    <InputField label="6.2.3 Date of Birth" type="date" value={currentTeacher.dob} onChange={(e) => setCurrentTeacher({ ...currentTeacher, dob: e.target.value })} />
                                                    <SelectField label="6.2.5 Social Category" value={currentTeacher.socialCategory} onChange={(e) => setCurrentTeacher({ ...currentTeacher, socialCategory: e.target.value })} options={["1-General", "2-SC", "3-ST", "4-OBC"]} />
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <InputField label="6.2.4 Teacher Code (State)" value={currentTeacher.teacherCodeState} onChange={(e) => setCurrentTeacher({ ...currentTeacher, teacherCodeState: e.target.value })} placeholder="State Code" />
                                                        <InputField label="Teacher National Code" value={currentTeacher.nationalCode} onChange={(e) => setCurrentTeacher({ ...currentTeacher, nationalCode: e.target.value })} placeholder="UDISE National ID" />
                                                    </div>
                                                    <InputField label="6.2.9 (a) Aadhaar Number" value={currentTeacher.aadhaarNumber} onChange={(e) => setCurrentTeacher({ ...currentTeacher, aadhaarNumber: e.target.value })} placeholder="12-digit Aadhaar" />
                                                    <InputField label="6.2.9 (b) Name as per Aadhaar" value={currentTeacher.aadhaarName} onChange={(e) => setCurrentTeacher({ ...currentTeacher, aadhaarName: e.target.value })} placeholder="Name on Aadhaar card" />
                                                </div>

                                                <div className="space-y-4">
                                                    <h4 className="font-bold text-sm text-neutral-800 uppercase tracking-wider border-b border-neutral-100 pb-2">MASTER DETAILS (PART A)</h4>
                                                    <div className="grid md:grid-cols-2 gap-5">
                                                        <SelectField
                                                            label="Academic Qualification (Level)"
                                                            value={currentTeacher.academicLevel}
                                                            onChange={(e) => setCurrentTeacher({ ...currentTeacher, academicLevel: e.target.value, academicDegree: "" })}
                                                            options={ACADEMIC_LEVELS}
                                                        />
                                                        <SelectField
                                                            label="Degree of Highest Acad. Qual."
                                                            value={currentTeacher.academicDegree}
                                                            onChange={(e) => setCurrentTeacher({ ...currentTeacher, academicDegree: e.target.value })}
                                                            options={ACADEMIC_DEGREES[currentTeacher.academicLevel] || ["NOT APPLICABLE"]}
                                                            disabled={!currentTeacher.academicLevel}
                                                        />
                                                        <div className="md:col-span-2">
                                                            <SelectField
                                                                label="Professional Qualification"
                                                                value={currentTeacher.professionalQual}
                                                                onChange={(e) => setCurrentTeacher({ ...currentTeacher, professionalQual: e.target.value, crrNumber: e.target.value === "7-Diploma/degree in special education" ? currentTeacher.crrNumber : "" })}
                                                                options={PROFESSIONAL_QUALIFICATIONS}
                                                            />
                                                            {currentTeacher.professionalQual === "7-Diploma/degree in special education" && (
                                                                <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                                                                    <InputField
                                                                        label="6.2.7 (b) Personal/Professional CRR Number (Mandatory for Special Educators)"
                                                                        value={currentTeacher.crrNumber}
                                                                        onChange={(e) => setCurrentTeacher({ ...currentTeacher, crrNumber: e.target.value })}
                                                                        placeholder="Enter CRR Number"
                                                                    />
                                                                    {!currentTeacher.crrNumber && (
                                                                        <p className="text-[10px] text-red-500 font-bold mt-1">⚠️ CRR Number is required for RCI registration verification.</p>
                                                                    )}
                                                                </div>
                                                            )}
                                                            {currentTeacher.professionalQual === "6-None" && (
                                                                <p className="mt-2 text-[10px] font-bold text-red-600 bg-red-50 p-2 rounded border border-red-200">
                                                                    ❌ UNQUALIFIED: Under RTE Act, professional teaching qualification is mandatory. This profile will trigger an audit flag.
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="pt-4 mt-4 border-t border-neutral-100">
                                                            <h5 className="font-semibold text-xs text-neutral-600 uppercase mb-4">6.2.10 Level up to which subjects are studied:</h5>
                                                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                                                                <SelectField label="(a) Mathematics" value={currentTeacher.subjectLevelMath} onChange={(e) => setCurrentTeacher({ ...currentTeacher, subjectLevelMath: e.target.value })} options={SUBJECT_LEVELS_3210} />
                                                                <SelectField label="(b) Science" value={currentTeacher.subjectLevelScience} onChange={(e) => setCurrentTeacher({ ...currentTeacher, subjectLevelScience: e.target.value })} options={SUBJECT_LEVELS_3210} />
                                                                <SelectField label="(c) English" value={currentTeacher.subjectLevelEnglish} onChange={(e) => setCurrentTeacher({ ...currentTeacher, subjectLevelEnglish: e.target.value })} options={SUBJECT_LEVELS_3210} />
                                                                <SelectField label="(d) Social Science" value={currentTeacher.subjectLevelSocialScience} onChange={(e) => setCurrentTeacher({ ...currentTeacher, subjectLevelSocialScience: e.target.value })} options={SUBJECT_LEVELS_3210} />
                                                                <SelectField label="(e) Language (Schedule VIII)" value={currentTeacher.subjectLevelLanguage} onChange={(e) => setCurrentTeacher({ ...currentTeacher, subjectLevelLanguage: e.target.value })} options={SUBJECT_LEVELS_3210} />
                                                                <SelectField label="6.2.11 Type of Disability" value={currentTeacher.disability} onChange={(e) => setCurrentTeacher({ ...currentTeacher, disability: e.target.value })} options={DISABILITY_TYPES_3211} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h4 className="font-bold text-sm text-neutral-800 uppercase tracking-wider border-b border-neutral-100 pb-2">APPOINTMENT & ROLE (PART B)</h4>
                                                    <div className="grid md:grid-cols-2 gap-5">
                                                        <SelectField label="Nature of Appointment" value={currentTeacher.natureOfAppointment} onChange={(e) => setCurrentTeacher({ ...currentTeacher, natureOfAppointment: e.target.value })} options={["1-Regular", "2-Contract", "3-Part-Time/Guest"]} />
                                                        <SelectField
                                                            label="Type of Teacher"
                                                            value={currentTeacher.teacherType}
                                                            onChange={(e) => {
                                                                const role = e.target.value;
                                                                let level = currentTeacher.appointedLevel;
                                                                if (role === "8-Lecturer") level = "3-PGT/Post Graduate Teacher";
                                                                if (["1-Head teacher", "6-Principal"].includes(role)) level = "4-Head Master/Principal";
                                                                setCurrentTeacher({ ...currentTeacher, teacherType: role, appointedLevel: level });
                                                            }}
                                                            options={TEACHER_TYPES}
                                                        />
                                                        <SelectField
                                                            label="6.2.17 Appointed for Level"
                                                            value={currentTeacher.appointedLevel}
                                                            onChange={(e) => setCurrentTeacher({ ...currentTeacher, appointedLevel: e.target.value })}
                                                            options={APPOINTED_LEVELS}
                                                        />
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <InputField label="6.2.13 Date of Joining Service" type="date" value={currentTeacher.dateJoiningService} onChange={(e) => setCurrentTeacher({ ...currentTeacher, dateJoiningService: e.target.value })} />
                                                            <InputField label="6.2.14 Date of Joining School" type="date" value={currentTeacher.dateJoiningPresentSchool} onChange={(e) => setCurrentTeacher({ ...currentTeacher, dateJoiningPresentSchool: e.target.value })} />
                                                        </div>
                                                        <SelectField
                                                            label="6.2.18 Appointed for Subject"
                                                            value={currentTeacher.appointedForSubject}
                                                            onChange={(e) => setCurrentTeacher({ ...currentTeacher, appointedForSubject: e.target.value })}
                                                            options={SUBJECTS_LIST}
                                                        />
                                                        <SelectField
                                                            label="6.2.16 Classes Taught"
                                                            value={currentTeacher.classesTaught}
                                                            onChange={(e) => setCurrentTeacher({ ...currentTeacher, classesTaught: e.target.value })}
                                                            options={[
                                                                "1-Primary only", "2-Upper primary only", "3-Primary and Upper primary",
                                                                "5-Secondary only", "6-Higher Secondary only", "7-Upper primary and Secondary",
                                                                "8-Secondary and Higher secondary", "10-Pre-Primary only", "11-Pre-Primary & Primary"
                                                            ]}
                                                        />
                                                        <div className="md:col-span-2 grid md:grid-cols-2 gap-5">
                                                            <SelectField
                                                                label="6.2.19 (a) Main Subject Taught 1"
                                                                value={currentTeacher.mainSubject1}
                                                                onChange={(e) => setCurrentTeacher({ ...currentTeacher, mainSubject1: e.target.value })}
                                                                options={SUBJECTS_LIST}
                                                            />
                                                            <SelectField
                                                                label="6.2.19 (b) Main Subject Taught 2"
                                                                value={currentTeacher.mainSubject2}
                                                                onChange={(e) => setCurrentTeacher({ ...currentTeacher, mainSubject2: e.target.value })}
                                                                options={SUBJECTS_LIST}
                                                            />
                                                        </div>
                                                        <div className="md:col-span-2 grid grid-cols-2 gap-5 pt-2">
                                                            <SelectField label="6.2.20 On Deputation from other school?" value={currentTeacher.isDeputation} onChange={(e) => setCurrentTeacher({ ...currentTeacher, isDeputation: e.target.value })} options={["1-Yes", "2-No"]} />
                                                            <SelectField label="6.2.21 Teaching at other School (Guest/Contr.)?" value={currentTeacher.isGuestContractual} onChange={(e) => setCurrentTeacher({ ...currentTeacher, isGuestContractual: e.target.value })} options={["1-Yes", "2-No"]} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h4 className="font-bold text-sm text-neutral-800 uppercase tracking-wider border-b border-neutral-100 pb-2">HIGHER SECONDARY SUBJECT MASTERY</h4>
                                                    <div className="grid md:grid-cols-2 gap-5">
                                                        <SelectField label="Physics Mastery Level" value={currentTeacher.hsMasteryPhysics} onChange={(e) => setCurrentTeacher({ ...currentTeacher, hsMasteryPhysics: e.target.value })} options={ACADEMIC_LEVELS} />
                                                        <SelectField label="Chemistry Mastery Level" value={currentTeacher.hsMasteryChemistry} onChange={(e) => setCurrentTeacher({ ...currentTeacher, hsMasteryChemistry: e.target.value })} options={ACADEMIC_LEVELS} />
                                                        <SelectField label="Biology Mastery Level" value={currentTeacher.hsMasteryBiology} onChange={(e) => setCurrentTeacher({ ...currentTeacher, hsMasteryBiology: e.target.value })} options={ACADEMIC_LEVELS} />
                                                        <SelectField label="Math Mastery Level" value={currentTeacher.hsMasteryMath} onChange={(e) => setCurrentTeacher({ ...currentTeacher, hsMasteryMath: e.target.value })} options={ACADEMIC_LEVELS} />
                                                    </div>
                                                    {(currentTeacher.classesTaught === "6-Higher Secondary only" || currentTeacher.classesTaught === "8-Secondary and Higher secondary") && (
                                                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[10px] text-blue-700 font-bold italic">
                                                            Higher Secondary Validation: Teachers for Class 11-12 Physics/Chemistry/Biology must have at least &quot;5-Post Graduate&quot; level recorded in their mastery.
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-4">
                                                    <h4 className="font-bold text-sm text-neutral-800 uppercase tracking-wider border-b border-neutral-100 pb-2">PART C: TRAINING & SKILLS</h4>
                                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                                                        <SelectField label="6.2.22 Trained for teaching CWSN?" value={currentTeacher.trainedCWSN} onChange={(e) => setCurrentTeacher({ ...currentTeacher, trainedCWSN: e.target.value })} options={["1-Yes", "2-No"]} />
                                                        <SelectField label="6.2.23 Trained in Computer for use in teaching?" value={currentTeacher.trainedComputer} onChange={(e) => setCurrentTeacher({ ...currentTeacher, trainedComputer: e.target.value })} options={["1-Yes", "2-No"]} />
                                                        <SelectField label="6.2.24 (c) Received NISHTHA training?" value={currentTeacher.isNishthaTrained} onChange={(e) => setCurrentTeacher({ ...currentTeacher, isNishthaTrained: e.target.value })} options={["1-Yes", "2-No"]} />
                                                        <InputField label="6.2.25 Days on NON-Teaching assignments" type="number" value={currentTeacher.nonTeachingDays} onChange={(e) => setCurrentTeacher({ ...currentTeacher, nonTeachingDays: e.target.value })} placeholder="0" />
                                                        <SelectField label="6.2.27 Trained in School Safety Audit?" value={currentTeacher.trainedSafety} onChange={(e) => setCurrentTeacher({ ...currentTeacher, trainedSafety: e.target.value })} options={["1-Yes", "2-No"]} />
                                                        <SelectField label="6.2.28 Trained in Cyber/Psycho-social?" value={currentTeacher.trainedCyberSafety} onChange={(e) => setCurrentTeacher({ ...currentTeacher, trainedCyberSafety: e.target.value })} options={["1-Yes", "2-No"]} />
                                                        <SelectField label="6.2.29 Trained in CWSN Identification?" value={currentTeacher.trainedCWSNIdentification} onChange={(e) => setCurrentTeacher({ ...currentTeacher, trainedCWSNIdentification: e.target.value })} options={["1-Yes", "2-No"]} />
                                                        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                                                            <SelectField label="6.2.30 CTET/STET Qualified?" value={currentTeacher.isTETQualified} onChange={(e) => setCurrentTeacher({ ...currentTeacher, isTETQualified: e.target.value, tetYear: e.target.value === "2-No" ? "" : currentTeacher.tetYear })} options={["1-Yes", "2-No"]} />
                                                            <InputField label="Year of Qualifying" type="number" value={currentTeacher.tetYear} onChange={(e) => setCurrentTeacher({ ...currentTeacher, tetYear: e.target.value })} placeholder="YYYY" disabled={currentTeacher.isTETQualified === "2-No"} />
                                                        </div>
                                                        <SelectField label="6.2.31 Capable of Digital Devices/VC?" value={currentTeacher.isCapableDigital} onChange={(e) => setCurrentTeacher({ ...currentTeacher, isCapableDigital: e.target.value })} options={["1-Yes", "2-No"]} />
                                                    </div>

                                                    <div className="space-y-6 pt-4 border-t border-neutral-100">
                                                        <div className="grid md:grid-cols-2 gap-5">
                                                            <SearchableMultiSelect
                                                                label="6.2.24 (a & b) Training Received/Needed"
                                                                options={TRAINING_LIST}
                                                                selected={currentTeacher.trainingReceived}
                                                                onChange={(items) => {
                                                                    if (items.includes("8-Not required")) {
                                                                        setCurrentTeacher({ ...currentTeacher, trainingReceived: ["8-Not required"] });
                                                                    } else {
                                                                        setCurrentTeacher({ ...currentTeacher, trainingReceived: items.filter(i => i !== "8-Not required") });
                                                                    }
                                                                }}
                                                                placeholder="Specific training sets..."
                                                            />
                                                            <SearchableMultiSelect
                                                                label="6.2.26 Working Knowledge of Languages"
                                                                options={LANGUAGES_126}
                                                                selected={currentTeacher.languages}
                                                                onChange={(items) => setCurrentTeacher({ ...currentTeacher, languages: items })}
                                                                placeholder="Search languages..."
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-4 justify-end pt-6 border-t border-neutral-100">
                                                    <button
                                                        onClick={() => setIsAddingTeacher(false)}
                                                        className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handleSaveTeacher}
                                                        className="px-8 py-2.5 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all"
                                                    >
                                                        {editingTeacherId ? "Update Profile" : "Add Teacher"}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeStaffTab === "non-teaching" && (
                                    <div className="space-y-6">
                                        {!isAddingNonTeaching ? (
                                            <div className="space-y-6">
                                                {/* Non-Teaching Audit */}
                                                {(schoolCategory.includes("Higher Secondary") || schoolCategory.includes("Secondary")) &&
                                                    !nonTeachingStaff.some(s => s.currentPost === "3-Laboratory Assistant") && (
                                                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                                                            <FiShield className="text-amber-600 shrink-0" />
                                                            <p className="text-[10px] font-bold text-amber-700 uppercase">
                                                                ADVISORY: Schools with Science stream are recommended to have at least one Laboratory Assistant (Section 6.3.1).
                                                            </p>
                                                        </div>
                                                    )}

                                                {nonTeachingStaff.length === 0 ? (
                                                    <div className="p-12 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                                                        <p className="text-neutral-400 text-sm">No non-teaching staff added yet. Click &quot;Add Staff&quot; to begin.</p>
                                                    </div>
                                                ) : (
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full border-collapse text-sm">
                                                            <thead>
                                                                <tr className="text-neutral-500 border-b border-neutral-100">
                                                                    <th className="p-3 text-left font-semibold">Staff Name</th>
                                                                    <th className="p-3 text-left font-semibold">Post</th>
                                                                    <th className="p-3 text-left font-semibold">Qualification</th>
                                                                    <th className="p-3 text-center font-semibold">Action</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-neutral-50">
                                                                {nonTeachingStaff.map((s) => (
                                                                    <tr key={s.id} className="hover:bg-neutral-50 transition-colors">
                                                                        <td className="p-3">
                                                                            <div className="font-medium text-neutral-800">{s.name}</div>
                                                                            <div className="text-[10px] text-neutral-400 italic">{s.gender}</div>
                                                                        </td>
                                                                        <td className="p-3 text-neutral-600 font-medium">{s.currentPost}</td>
                                                                        <td className="p-3 text-neutral-600">{s.academicLevel}</td>
                                                                        <td className="p-3 text-center flex items-center justify-center gap-4">
                                                                            <button
                                                                                onClick={() => {
                                                                                    setCurrentNonTeachingStaff(s);
                                                                                    setEditingNonTeachingId(s.id);
                                                                                    setIsAddingNonTeaching(true);
                                                                                }}
                                                                                className="text-primary-600 hover:text-primary-800 font-bold text-xs"
                                                                            >
                                                                                Edit
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDeleteNonTeachingStaff(s.id)}
                                                                                className="text-red-500 hover:text-red-700 font-bold text-xs"
                                                                            >
                                                                                Delete
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-8 p-6 bg-neutral-50 rounded-2xl border border-neutral-200">
                                                <div className="grid md:grid-cols-2 gap-5">
                                                    <SelectField label="6.3.1 Post Name" value={currentNonTeachingStaff.currentPost} onChange={(e) => setCurrentNonTeachingStaff({ ...currentNonTeachingStaff, currentPost: e.target.value })} options={NON_TEACHING_POSTS} />
                                                    <InputField label="6.3.2 Name of Staff (Capital)" value={currentNonTeachingStaff.name} onChange={(e) => setCurrentNonTeachingStaff({ ...currentNonTeachingStaff, name: e.target.value.toUpperCase() })} placeholder="FULL NAME" />
                                                    <SelectField label="6.3.3 Gender" value={currentNonTeachingStaff.gender} onChange={(e) => setCurrentNonTeachingStaff({ ...currentNonTeachingStaff, gender: e.target.value })} options={["1-Male", "2-Female", "3-Transgender"]} />
                                                    <InputField label="6.3.4 Date of Birth" type="date" value={currentNonTeachingStaff.dob} onChange={(e) => setCurrentNonTeachingStaff({ ...currentNonTeachingStaff, dob: e.target.value })} />
                                                    <SelectField label="6.3.5 Social Category" value={currentNonTeachingStaff.socialCategory} onChange={(e) => setCurrentNonTeachingStaff({ ...currentNonTeachingStaff, socialCategory: e.target.value })} options={["1-General", "2-SC", "3-ST", "4-OBC"]} />
                                                    <SelectField label="6.3.6 Academic Qualification" value={currentNonTeachingStaff.academicLevel} onChange={(e) => setCurrentNonTeachingStaff({ ...currentNonTeachingStaff, academicLevel: e.target.value })} options={ACADEMIC_LEVELS} />
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <InputField label="6.3.7 (a) Mobile" type="tel" value={currentNonTeachingStaff.mobile} onChange={(e) => setCurrentNonTeachingStaff({ ...currentNonTeachingStaff, mobile: e.target.value })} placeholder="10-digit" />
                                                        <InputField label="6.3.7 (b) Email" type="email" value={currentNonTeachingStaff.email} onChange={(e) => setCurrentNonTeachingStaff({ ...currentNonTeachingStaff, email: e.target.value })} placeholder="email@school.com" />
                                                    </div>
                                                    <InputField label="6.3.8 (a) Aadhaar Number" value={currentNonTeachingStaff.aadhaarNumber} onChange={(e) => setCurrentNonTeachingStaff({ ...currentNonTeachingStaff, aadhaarNumber: e.target.value })} placeholder="12-digit" />
                                                    <InputField label="6.3.8 (b) Name as per Aadhaar" value={currentNonTeachingStaff.aadhaarName} onChange={(e) => setCurrentNonTeachingStaff({ ...currentNonTeachingStaff, aadhaarName: e.target.value })} placeholder="Name on card" />
                                                    <SelectField label="Nature of Appointment" value={currentNonTeachingStaff.natureOfAppointment} onChange={(e) => setCurrentNonTeachingStaff({ ...currentNonTeachingStaff, natureOfAppointment: e.target.value })} options={["1-Regular", "2-Contract", "3-Part-Time/Guest"]} />
                                                    <InputField label="6.3.10 Date of Joining" type="date" value={currentNonTeachingStaff.dateJoiningService} onChange={(e) => setCurrentNonTeachingStaff({ ...currentNonTeachingStaff, dateJoiningService: e.target.value })} />
                                                </div>

                                                <div className="flex gap-4 justify-end pt-6 border-t border-neutral-100">
                                                    <button onClick={() => setIsAddingNonTeaching(false)} className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors">Cancel</button>
                                                    <button onClick={handleSaveNonTeachingStaff} className="px-8 py-2.5 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all">
                                                        {editingNonTeachingId ? "Update Staff" : "Add Staff"}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeStaffTab === "vocational" && (
                                    <div className="space-y-6">
                                        {!isAddingVocational ? (
                                            <div className="space-y-6">
                                                {/* Vocational Area Audit */}
                                                {vocationalStaff.some(v => !vocationalRows.some(row => row.sector === v.sector)) && (
                                                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                                                        <FiShield className="text-red-600 shrink-0" />
                                                        <p className="text-[10px] font-bold text-red-700">
                                                            ALIGNMENT ERROR: One or more trainers are assigned to sectors not declared in Section 1.30. Please verify vocational course offerings.
                                                        </p>
                                                    </div>
                                                )}

                                                {vocationalStaff.length === 0 ? (
                                                    <div className="p-12 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                                                        <p className="text-neutral-400 text-sm">No vocational resource persons added yet. Click &quot;Add Resource Person&quot; to begin.</p>
                                                    </div>
                                                ) : (
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full border-collapse text-sm">
                                                            <thead>
                                                                <tr className="text-neutral-500 border-b border-neutral-100">
                                                                    <th className="p-3 text-left font-semibold">Resource Person</th>
                                                                    <th className="p-3 text-left font-semibold">Sector</th>
                                                                    <th className="p-3 text-left font-semibold">Experience</th>
                                                                    <th className="p-3 text-center font-semibold">Action</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-neutral-50">
                                                                {vocationalStaff.map((v) => (
                                                                    <tr key={v.id} className="hover:bg-neutral-50 transition-colors">
                                                                        <td className="p-3">
                                                                            <div className="font-medium text-neutral-800">{v.name}</div>
                                                                            <div className="text-[10px] text-neutral-400 italic">{v.natureOfAppointment}</div>
                                                                        </td>
                                                                        <td className="p-3 text-neutral-600 font-medium truncate max-w-[150px]">{v.sector}</td>
                                                                        <td className="p-3 text-neutral-600">{v.experience}</td>
                                                                        <td className="p-3 text-center flex items-center justify-center gap-4">
                                                                            <button
                                                                                onClick={() => {
                                                                                    setCurrentVocationalStaff(v);
                                                                                    setEditingVocationalId(v.id);
                                                                                    setIsAddingVocational(true);
                                                                                }}
                                                                                className="text-primary-600 hover:text-primary-800 font-bold text-xs"
                                                                            >
                                                                                Edit
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDeleteVocationalStaff(v.id)}
                                                                                className="text-red-500 hover:text-red-700 font-bold text-xs"
                                                                            >
                                                                                Delete
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-8 p-6 bg-neutral-50 rounded-2xl border border-neutral-200">
                                                <div className="space-y-4">
                                                    <h4 className="font-bold text-sm text-neutral-800 uppercase tracking-widest border-b border-neutral-100 pb-2">PART A: IDENTITY & ELIGIBILITY</h4>
                                                    <div className="grid md:grid-cols-2 gap-5">
                                                        <InputField label="6.4.3 Name of Resource Person (Capital)" value={currentVocationalStaff.name} onChange={(e) => setCurrentVocationalStaff({ ...currentVocationalStaff, name: e.target.value.toUpperCase() })} placeholder="FULL NAME" />
                                                        <SelectField label="6.4.4 Gender" value={currentVocationalStaff.gender} onChange={(e) => setCurrentVocationalStaff({ ...currentVocationalStaff, gender: e.target.value })} options={["1-Male", "2-Female", "3-Transgender"]} />
                                                        <InputField label="6.4.5 Date of Birth" type="date" value={currentVocationalStaff.dob} onChange={(e) => setCurrentVocationalStaff({ ...currentVocationalStaff, dob: e.target.value })} />
                                                        <SelectField label="6.4.6 Social Category" value={currentVocationalStaff.socialCategory} onChange={(e) => setCurrentVocationalStaff({ ...currentVocationalStaff, socialCategory: e.target.value })} options={["1-General", "2-SC", "3-ST", "4-OBC"]} />
                                                        <SelectField label="6.4.8 Academic Qualification" value={currentVocationalStaff.academicLevel} onChange={(e) => setCurrentVocationalStaff({ ...currentVocationalStaff, academicLevel: e.target.value })} options={ACADEMIC_LEVELS} />
                                                        <SelectField label="6.4.9 Prof. Qualification" value={currentVocationalStaff.professionalQual} onChange={(e) => setCurrentVocationalStaff({ ...currentVocationalStaff, professionalQual: e.target.value })} options={VOCATIONAL_PROF_QUAL} />
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <InputField label="6.4.13 (a) Mobile" type="tel" value={currentVocationalStaff.mobile} onChange={(e) => setCurrentVocationalStaff({ ...currentVocationalStaff, mobile: e.target.value })} placeholder="10-digit" />
                                                            <InputField label="6.4.13 (b) Email" type="email" value={currentVocationalStaff.email} onChange={(e) => setCurrentVocationalStaff({ ...currentVocationalStaff, email: e.target.value })} placeholder="email@school.com" />
                                                        </div>
                                                        <InputField label="6.4.14 (a) Aadhaar Number" value={currentVocationalStaff.aadhaarNumber} onChange={(e) => setCurrentVocationalStaff({ ...currentVocationalStaff, aadhaarNumber: e.target.value })} placeholder="12-digit" />
                                                        <InputField label="6.4.14 (b) Name as per Aadhaar" value={currentVocationalStaff.aadhaarName} onChange={(e) => setCurrentVocationalStaff({ ...currentVocationalStaff, aadhaarName: e.target.value })} placeholder="Name on card" />
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h4 className="font-bold text-sm text-neutral-800 uppercase tracking-widest border-b border-neutral-100 pb-2">PART B: APPOINTMENT & SERVICE</h4>
                                                    <div className="grid md:grid-cols-2 gap-5">
                                                        <SelectField label="6.4.1 Sector" value={currentVocationalStaff.sector} onChange={(e) => setCurrentVocationalStaff({ ...currentVocationalStaff, sector: e.target.value })} options={VOCATIONAL_SECTORS} />
                                                        <InputField label="6.4.2 Job Role" value={currentVocationalStaff.jobRole} onChange={(e) => setCurrentVocationalStaff({ ...currentVocationalStaff, jobRole: e.target.value })} placeholder="e.g. Domestic Data Entry Operator" />
                                                        <SelectField label="6.4.7 Nature of Appointment" value={currentVocationalStaff.natureOfAppointment} onChange={(e) => setCurrentVocationalStaff({ ...currentVocationalStaff, natureOfAppointment: e.target.value })} options={["11-Regular", "12-Contractual", "13-Guest Faculty"]} />
                                                        <SelectField label="6.4.10 Industry Experience" value={currentVocationalStaff.experience} onChange={(e) => setCurrentVocationalStaff({ ...currentVocationalStaff, experience: e.target.value })} options={INDUSTRY_EXPERIENCE} />
                                                        <SelectField label="6.4.11 Classes Taught" value={currentVocationalStaff.classesTaught} onChange={(e) => setCurrentVocationalStaff({ ...currentVocationalStaff, classesTaught: e.target.value })} options={["5-Secondary only", "6-Higher Secondary only", "8-Secondary and Higher secondary"]} />
                                                        <SelectField label="6.4.12 Received Induction training?" value={currentVocationalStaff.receivedInduction} onChange={(e) => setCurrentVocationalStaff({ ...currentVocationalStaff, receivedInduction: e.target.value })} options={["1-Yes", "2-No"]} />
                                                    </div>
                                                </div>

                                                <div className="flex gap-4 justify-end pt-6 border-t border-neutral-100">
                                                    <button onClick={() => setIsAddingVocational(false)} className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors">Cancel</button>
                                                    <button onClick={handleSaveVocationalStaff} className="px-8 py-2.5 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all">
                                                        {editingVocationalId ? "Update Profile" : "Add Resource Person"}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                }


                {/* Step 6: Safety */}
                {
                    currentStep === 6 && (
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-lg font-semibold text-neutral-800 mb-1">Section 7: School Safety and Security</h3>
                                <p className="text-sm text-neutral-500 mb-6">Complete all safety compliance declarations. Critical fields require document uploads.</p>

                                {/* 1.58.1 - 1.58.8 Mandatory Safety Compliance */}
                                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6 mb-6">
                                    <h4 className="font-semibold text-base text-primary-800 pb-2 border-b border-neutral-100">Mandatory Safety Compliance (7.1 – 7.8)</h4>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* 1.58.1 School Disaster Management Plan */}
                                        <div className="space-y-3">
                                            <SelectField
                                                label="7.1 Whether the School Disaster Management Plan (SDMP) has been developed? (1-Yes, 2-No)"
                                                value={hasDisasterPlan}
                                                onChange={(e) => setHasDisasterPlan(e.target.value)}
                                                options={["1-Yes", "2-No"]}
                                            />
                                            {hasDisasterPlan === "1-Yes" && (
                                                <UploadField label="Upload SDMP Document" />
                                            )}
                                            {["New Recognition", "Renewal"].includes(applicationType) && hasDisasterPlan === "2-No" && (
                                                <p className="text-xs font-bold text-red-600 bg-red-50 p-2 rounded border border-red-200">❌ Non-Compliant: SDMP is a mandatory legal requirement.</p>
                                            )}
                                        </div>

                                        {/* 1.58.2 Structural Safety Audit */}
                                        <div className="space-y-3">
                                            <SelectField
                                                label="7.2 Whether Structural Safety Audit has been conducted? (1-Yes, 2-No)"
                                                value={hasStructuralAudit}
                                                onChange={(e) => setHasStructuralAudit(e.target.value)}
                                                options={["1-Yes", "2-No"]}
                                            />
                                            {hasStructuralAudit === "1-Yes" && (
                                                <UploadField label="Upload PWD Structural Safety Certificate" />
                                            )}
                                            {["New Recognition", "Renewal"].includes(applicationType) && hasStructuralAudit === "2-No" && (
                                                <p className="text-xs font-bold text-red-600 bg-red-50 p-2 rounded border border-red-200">❌ Non-Compliant: Structural safety certificate is mandatory.</p>
                                            )}
                                        </div>

                                        {/* 1.58.3 Non-Structural Safety Audit */}
                                        <div className="space-y-3">
                                            <SelectField
                                                label="7.3 Whether Non-Structural Safety Audit has been conducted? (1-Yes, 2-No)"
                                                value={hasNonStructuralAudit}
                                                onChange={(e) => setHasNonStructuralAudit(e.target.value)}
                                                options={["1-Yes", "2-No"]}
                                            />
                                        </div>

                                        {/* 1.58.4 CCTV Cameras */}
                                        <div className="space-y-3">
                                            <SelectField
                                                label="7.4 Whether CCTV Cameras are available in school? (1-Yes, 2-No)"
                                                value={hasCCTV}
                                                onChange={(e) => setHasCCTV(e.target.value)}
                                                options={["1-Yes", "2-No"]}
                                            />
                                            {applicationType === "Upgradation" && hasCCTV === "2-No" && (
                                                <p className="text-[10px] text-amber-600 font-semibold italic">Upgradation: Ensure CCTV coverage extends to new classrooms/buildings.</p>
                                            )}
                                        </div>

                                        {/* 1.58.5 Fire Extinguishers */}
                                        <div className="space-y-3">
                                            <SelectField
                                                label="7.5 Whether Fire Extinguishers are installed? (1-Yes, 2-No)"
                                                value={hasFireExtinguishers}
                                                onChange={(e) => setHasFireExtinguishers(e.target.value)}
                                                options={["1-Yes", "2-No"]}
                                            />
                                            {hasFireExtinguishers === "1-Yes" && (
                                                <UploadField label="Upload Fire Department Certificate" />
                                            )}
                                            {["New Recognition", "Renewal"].includes(applicationType) && hasFireExtinguishers === "2-No" && (
                                                <p className="text-xs font-bold text-red-600 bg-red-50 p-2 rounded border border-red-200">❌ Non-Compliant: Fire extinguishers are a mandatory safety requirement.</p>
                                            )}
                                        </div>

                                        {/* 1.58.6 Nodal Teacher */}
                                        <div className="space-y-3">
                                            <SelectField
                                                label="7.6 Does the school have a nodal teacher for school safety? (1-Yes, 2-No)"
                                                value={hasNodalTeacher}
                                                onChange={(e) => setHasNodalTeacher(e.target.value)}
                                                options={["1-Yes", "2-No"]}
                                            />
                                        </div>

                                        {/* 1.58.7 Safety Training */}
                                        <div className="space-y-3">
                                            <SelectField
                                                label="7.7 Whether students and teachers undergo regular training in school safety and disaster preparedness? (1-Yes, 2-No)"
                                                value={hasSafetyTraining}
                                                onChange={(e) => setHasSafetyTraining(e.target.value)}
                                                options={["1-Yes", "2-No"]}
                                            />
                                            {hasSafetyTraining === "1-Yes" && applicationType === "Renewal" && (
                                                <InputField
                                                    label="Date of Last Training"
                                                    type="date"
                                                    value={safetyTrainingDate}
                                                    onChange={(e) => setSafetyTrainingDate(e.target.value)}
                                                />
                                            )}
                                        </div>

                                        {/* 1.58.8 Disaster Management in Curriculum */}
                                        <div className="space-y-3">
                                            <SelectField
                                                label="7.8 Whether disaster management is being taught as part of the curriculum? (1-Yes, 2-No)"
                                                value={disasterManagementTaught}
                                                onChange={(e) => setDisasterManagementTaught(e.target.value)}
                                                options={["1-Yes", "2-No"]}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 1.58.9 - 1.58.15: Girls Self Defence, Safety Awareness & Counseling */}
                                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6 mb-6">
                                    <h4 className="font-semibold text-base text-primary-800 pb-2 border-b border-neutral-100">Operational Safety Procedures (7.9 – 7.15)</h4>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* 1.58.9 Self Defence Grant */}
                                        <div className="space-y-3 md:col-span-2">
                                            <SelectField
                                                label="7.9 Whether school has received grant for Self Defense Training for Girls? (1-Yes, 2-No)"
                                                value={hasSelfDefenceGrant}
                                                onChange={(e) => setHasSelfDefenceGrant(e.target.value)}
                                                options={["1-Yes", "2-No"]}
                                            />
                                        </div>

                                        {/* 1.58.9(a) Self Defence Training Numbers */}
                                        {(hasSelfDefenceGrant === "1-Yes" || (schoolCategory.includes("Upper Primary") || schoolCategory.includes("Secondary"))) && (
                                            <>
                                                <div className="md:col-span-2">
                                                    <p className="text-sm font-semibold text-neutral-700 mb-2">1.58.9 (a) Mention Number of Girls Student provided Self Defence training at:</p>
                                                </div>
                                                <InputField
                                                    label="(i) Upper Primary"
                                                    value={selfDefenceUpperPrimary}
                                                    onChange={(e) => setSelfDefenceUpperPrimary(e.target.value)}
                                                    type="number"
                                                    placeholder="Number of girls"
                                                />
                                                <InputField
                                                    label="(ii) Secondary"
                                                    value={selfDefenceSecondary}
                                                    onChange={(e) => setSelfDefenceSecondary(e.target.value)}
                                                    type="number"
                                                    placeholder="Number of girls"
                                                />
                                                <InputField
                                                    label="(iii) Higher Secondary"
                                                    value={selfDefenceHigherSecondary}
                                                    onChange={(e) => setSelfDefenceHigherSecondary(e.target.value)}
                                                    type="number"
                                                    placeholder="Number of girls"
                                                />
                                            </>
                                        )}

                                        {/* 1.58.10 Safety Display Board */}
                                        <div className="space-y-3">
                                            <SelectField
                                                label="7.10 Whether the school has displayed safety guidelines on Display Board? (1-Yes, 2-No)"
                                                value={hasSafetyDisplayBoard}
                                                onChange={(e) => setHasSafetyDisplayBoard(e.target.value)}
                                                options={["1-Yes", "2-No"]}
                                            />
                                        </div>

                                        {/* 1.58.11 First Level Counselor */}
                                        <div className="space-y-3">
                                            <SelectField
                                                label="7.11 Whether the school has appointed any teacher as a first level counselor? (1-Yes, 2-No)"
                                                value={hasFirstLevelCounselor}
                                                onChange={(e) => setHasFirstLevelCounselor(e.target.value)}
                                                options={["1-Yes", "2-No"]}
                                            />
                                            {applicationType === "Upgradation" && hasFirstLevelCounselor === "2-No" && (
                                                <p className="text-[10px] text-amber-600 font-semibold italic">
                                                    Mandatory for Upgradation: Having a first level counselor is required for higher classes.
                                                </p>
                                            )}
                                        </div>

                                        {/* 1.58.12 Safety Audit Frequency */}
                                        <div className="space-y-3 md:col-span-2">
                                            <SelectField
                                                label="7.12 Frequency of safety and security audit of schools for ensuring child safety by involving all stakeholders (SMC, Parents, Senior Students etc)"
                                                value={safetyAuditFrequency}
                                                onChange={(e) => setSafetyAuditFrequency(e.target.value)}
                                                options={[
                                                    "1-Once a year",
                                                    "2-Twice a year",
                                                    "3-Three times a year",
                                                    "4-Four times a year",
                                                    "5-More than four times a year",
                                                    "6-None"
                                                ]}
                                            />
                                            {safetyAuditFrequency === "6-None" && (
                                                <p className="text-xs font-bold text-red-600 bg-red-50 p-2 rounded border border-red-200">
                                                    ⚠️ High Risk: No safety audits conducted. This is critical for compliance.
                                                </p>
                                            )}
                                        </div>

                                        {/* 1.58.13 Teacher Photos Display */}
                                        <div className="space-y-3">
                                            <SelectField
                                                label="7.13 Is the school displaying photographs of all teachers in a school? (1-Yes, 2-No)"
                                                value={hasTeacherPhotos}
                                                onChange={(e) => setHasTeacherPhotos(e.target.value)}
                                                options={["1-Yes", "2-No"]}
                                            />
                                        </div>

                                        {/* 1.58.14 Vidya Pravesh Module (conditional on having Grade 1) */}
                                        {hasGrade1 && (
                                            <div className="space-y-3">
                                                <SelectField
                                                    label="7.14 Has the school adopted/initiated Vidya Pravesh Module? (1-Yes, 2-No)"
                                                    value={hasVidyaPravesh}
                                                    onChange={(e) => setHasVidyaPravesh(e.target.value)}
                                                    options={["1-Yes", "2-No"]}
                                                />
                                            </div>
                                        )}

                                        {/* 1.58.15 Student Attendance Capture */}
                                        <div className="space-y-3">
                                            <SelectField
                                                label="7.15 Students' attendance captured?"
                                                value={studentAttendanceCapture}
                                                onChange={(e) => setStudentAttendanceCapture(e.target.value)}
                                                options={[
                                                    "1-Attendance Register",
                                                    "2-Electronically",
                                                    "3-Biometric"
                                                ]}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 1.58.16 - 1.58.20: Attendance, Clubs & Certification */}
                                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
                                    <h4 className="font-semibold text-base text-primary-800 pb-2 border-b border-neutral-100">Certifications & Physical Checks (7.16 – 7.20)</h4>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* 1.58.16 Teacher Attendance Capture */}
                                        <div className="space-y-3">
                                            <SelectField
                                                label="7.16 Teachers' attendance captured?"
                                                value={teacherAttendanceCapture}
                                                onChange={(e) => setTeacherAttendanceCapture(e.target.value)}
                                                options={[
                                                    "1-Attendance Register",
                                                    "2-Electronically",
                                                    "3-Biometric"
                                                ]}
                                            />
                                        </div>

                                        {/* 1.58.17 Youth Club */}
                                        <div className="space-y-3">
                                            <SelectField
                                                label="7.17 Whether the school has constituted Youth Club? (1-Yes, 2-No)"
                                                value={hasYouthClub}
                                                onChange={(e) => setHasYouthClub(e.target.value)}
                                                options={["1-Yes", "2-No"]}
                                            />
                                        </div>

                                        {/* 1.58.18 Eco Club */}
                                        <div className="space-y-3">
                                            <SelectField
                                                label="7.18 Whether the school has constituted Eco Club? (1-Yes, 2-No)"
                                                value={hasEcoClub}
                                                onChange={(e) => setHasEcoClub(e.target.value)}
                                                options={["1-Yes", "2-No"]}
                                            />
                                        </div>

                                        {/* 1.58.19 Teacher Identity Cards */}
                                        <div className="space-y-3">
                                            <SelectField
                                                label="7.19 Whether Teacher Identity Cards are issued to all teachers in the school? (1-Yes, 2-No)"
                                                value={hasTeacherID}
                                                onChange={(e) => setHasTeacherID(e.target.value)}
                                                options={["1-Yes", "2-No"]}
                                            />
                                            {applicationType === "New Recognition" && hasTeacherID === "2-No" && (
                                                <p className="text-[10px] text-red-600 font-bold">
                                                    Mandatory: Teacher ID cards are required for security compliance.
                                                </p>
                                            )}
                                        </div>

                                        {/* 1.58.20 SSSA Self-Certification */}
                                        <div className="space-y-3 md:col-span-2">
                                            <SelectField
                                                label="7.20 State School Standard Authority (SSSA) self-certification obtained? (1-Yes, 2-No)"
                                                value={sssaCertification}
                                                onChange={(e) => setSssaCertification(e.target.value)}
                                                options={["1-Yes", "2-No"]}
                                            />
                                            {sssaCertification === "1-Yes" && (
                                                <UploadField label="Upload SSSA Certificate / Self-Certification Receipt" />
                                            )}
                                            {sssaCertification === "2-No" && (
                                                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                                                    <p className="text-sm font-bold text-red-700">
                                                        ⚠️ Final Blocker: Self-certification is required for final submission of recognition/renewal applications.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Step 7: Student Capacity — Section Details (Set Once) */}
                {
                    currentStep === 7 && (
                        <div className="space-y-8">
                            {/* Context Banner */}
                            <div className={`p-4 rounded-xl border ${applicationType === "New Recognition"
                                ? "bg-blue-50 border-blue-200"
                                : applicationType === "Renewal"
                                    ? "bg-amber-50 border-amber-200"
                                    : "bg-purple-50 border-purple-200"
                                }`}>
                                <p className={`text-sm font-semibold ${applicationType === "New Recognition"
                                    ? "text-blue-800"
                                    : applicationType === "Renewal"
                                        ? "text-amber-800"
                                        : "text-purple-800"
                                    }`}>
                                    {applicationType === "New Recognition"
                                        ? "📋 Declare the classes and sections you intend to start with. This is a one-time setup."
                                        : applicationType === "Renewal"
                                            ? "🔄 Verify that your current class-section structure matches your recognition."
                                            : "⬆️ Update your class-section structure for the new recognition level."
                                    }
                                </p>
                                <p className="text-xs text-neutral-500 mt-1">
                                    Section 8, Part A — Section Details (Need to set once before feeding student data)
                                </p>
                            </div>

                            {/* Warning if class range not set */}
                            {(!lowestClass || !highestClass) ? (
                                <div className="p-6 rounded-xl border-2 border-dashed border-red-200 bg-red-50 text-center">
                                    <p className="text-sm font-bold text-red-700">⚠️ Please set the Lowest and Highest class in &quot;Basic Details&quot; → Section 1.17 first.</p>
                                    <p className="text-xs text-red-500 mt-1">The class-section configuration is auto-generated from your school&apos;s approved class range.</p>
                                </div>
                            ) : sectionConfigs.length === 0 ? (
                                <div className="p-6 rounded-xl border-2 border-dashed border-amber-200 bg-amber-50 text-center">
                                    <p className="text-sm font-bold text-amber-700">⚠️ Invalid class range. Lowest class must be ≤ Highest class (1–12).</p>
                                </div>
                            ) : (
                                <>
                                    {/* Section Configuration Table */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-neutral-800 mb-4 pb-2 border-b border-neutral-100">
                                            8.A Class &amp; Section Configuration
                                        </h3>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm border border-neutral-200 rounded-xl overflow-hidden">
                                                <thead>
                                                    <tr className="bg-neutral-50 text-neutral-700">
                                                        <th className="text-left px-4 py-3 font-semibold border-b border-neutral-200 w-12">#</th>
                                                        <th className="text-left px-4 py-3 font-semibold border-b border-neutral-200">Class / Grade</th>
                                                        <th className="text-center px-4 py-3 font-semibold border-b border-neutral-200 w-48">No. of Sections</th>
                                                        <th className="text-left px-4 py-3 font-semibold border-b border-neutral-200">Section Names (Auto)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {sectionConfigs.map((cfg, idx) => (
                                                        <tr key={cfg.className} className={`border-b border-neutral-100 ${["Nursery", "LKG", "UKG"].includes(cfg.className)
                                                            ? "bg-violet-50/50"
                                                            : idx % 2 === 0 ? "bg-white" : "bg-neutral-50/50"
                                                            }`}>
                                                            <td className="px-4 py-3 text-neutral-400 font-mono text-xs">{idx + 1}</td>
                                                            <td className="px-4 py-3 font-medium text-neutral-800">
                                                                {cfg.className}
                                                                {["Nursery", "LKG", "UKG"].includes(cfg.className) && (
                                                                    <span className="ml-2 text-[10px] font-bold text-violet-600 bg-violet-100 px-1.5 py-0.5 rounded-full">Pre-Primary</span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                {isSectionConfigSaved ? (
                                                                    <span className="font-semibold text-neutral-700">{cfg.numberOfSections}</span>
                                                                ) : (
                                                                    <select
                                                                        value={cfg.numberOfSections}
                                                                        onChange={(e) => handleSectionCountChange(idx, parseInt(e.target.value))}
                                                                        className="w-20 mx-auto px-2 py-1.5 border border-neutral-300 rounded-lg text-center text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all cursor-pointer"
                                                                    >
                                                                        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                                                                            <option key={n} value={n}>{n}</option>
                                                                        ))}
                                                                    </select>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {cfg.sectionNames.map(name => (
                                                                        <span key={name} className="px-2.5 py-1 bg-primary-100 text-primary-700 rounded-lg text-xs font-bold border border-primary-200">
                                                                            {name}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Lock / Edit Button */}
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-neutral-500">
                                            <span className="font-semibold text-neutral-700">{sectionConfigs.length}</span> class(es) &middot;&nbsp;
                                            <span className="font-semibold text-neutral-700">{sectionConfigs.reduce((sum, c) => sum + c.numberOfSections, 0)}</span> total section(s)
                                        </div>
                                        {isSectionConfigSaved ? (
                                            <button
                                                onClick={() => setIsSectionConfigSaved(false)}
                                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-300 transition-all"
                                            >
                                                ✏️ Edit Configuration
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setIsSectionConfigSaved(true)}
                                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all"
                                            >
                                                <FiCheck size={16} /> Lock Configuration
                                            </button>
                                        )}
                                    </div>

                                    {/* Section 4.B: Individual Student Profile Entry */}
                                    <div className="pt-8 border-t border-neutral-100">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h3 className="text-lg font-semibold text-neutral-800">8.B Individual Student Profile Entry</h3>
                                                <p className="text-sm text-neutral-500">Add or edit individual student details as per UIDSE+ standards.</p>
                                            </div>
                                            {!isAddingStudent && (
                                                <button
                                                    onClick={() => setIsAddingStudent(true)}
                                                    className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20"
                                                >
                                                    + Add Student
                                                </button>
                                            )}
                                        </div>

                                        {!isAddingStudent ? (
                                            <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
                                                {students.length === 0 ? (
                                                    <div className="p-12 text-center text-neutral-400">
                                                        <p className="text-base font-medium mb-1">No student profiles added yet.</p>
                                                        <p className="text-xs">Click the &quot;Add Student&quot; button to begin enrollment.</p>
                                                    </div>
                                                ) : (
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-sm">
                                                            <thead>
                                                                <tr className="bg-neutral-50 text-neutral-500 border-b border-neutral-100">
                                                                    <th className="px-4 py-3 text-left font-semibold">Student Name</th>
                                                                    <th className="px-4 py-3 text-left font-semibold">Gender / DOB</th>
                                                                    <th className="px-4 py-3 text-left font-semibold">Aadhaar / National Code</th>
                                                                    <th className="px-4 py-3 text-center font-semibold w-32">Actions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-neutral-50">
                                                                {students.map((s) => (
                                                                    <tr key={s.id} className="hover:bg-neutral-50/50 transition-colors">
                                                                        <td className="px-4 py-4">
                                                                            <p className="font-bold text-neutral-800">{s.name}</p>
                                                                            <p className="text-[10px] text-neutral-500 italic">ID: {s.id}</p>
                                                                        </td>
                                                                        <td className="px-4 py-4 text-neutral-600">
                                                                            <p>{s.gender}</p>
                                                                            <p className="text-[11px] font-mono">{s.dob}</p>
                                                                        </td>
                                                                        <td className="px-4 py-4 text-neutral-600">
                                                                            <p className="font-mono text-xs">{s.aadhaarNumber || "N/A"}</p>
                                                                            <p className="text-[11px] text-primary-600 font-bold uppercase tracking-tighter">Verified: {s.aadhaarName ? "Yes" : "No"}</p>
                                                                        </td>
                                                                        <td className="px-4 py-4">
                                                                            <div className="flex items-center justify-center gap-4">
                                                                                <button onClick={() => handleEditStudent(s)} className="text-primary-600 hover:text-primary-800 font-bold text-xs underline decoration-2 underline-offset-4">Edit</button>
                                                                                <button onClick={() => handleDeleteStudent(s.id)} className="text-red-500 hover:text-red-700 font-bold text-xs underline decoration-2 underline-offset-4">Delete</button>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-8 bg-neutral-50 p-8 rounded-3xl border border-neutral-200">
                                                {/* Identity Group */}
                                                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
                                                    <h4 className="font-bold text-sm text-primary-800 uppercase tracking-widest border-b border-neutral-100 pb-2">PART A: IDENTITY</h4>
                                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                        <div className="lg:col-span-2">
                                                            <InputField
                                                                label="8.1.1 Name of Student (Capital letters)"
                                                                value={currentStudent.name}
                                                                onChange={(e) => setCurrentStudent({ ...currentStudent, name: e.target.value.toUpperCase() })}
                                                                placeholder="FULL NAME AS PER RECORDS"
                                                            />
                                                        </div>
                                                        <SelectField
                                                            label="8.1.2 Gender"
                                                            value={currentStudent.gender}
                                                            onChange={(e) => setCurrentStudent({ ...currentStudent, gender: e.target.value })}
                                                            options={["1-Male", "2-Female", "3-Transgender"]}
                                                        />
                                                        <InputField
                                                            label="8.1.3 Date of Birth"
                                                            type="date"
                                                            value={currentStudent.dob}
                                                            onChange={(e) => setCurrentStudent({ ...currentStudent, dob: e.target.value })}
                                                        />
                                                        <InputField
                                                            label="8.1.4 Mother's Name"
                                                            value={currentStudent.motherName}
                                                            onChange={(e) => setCurrentStudent({ ...currentStudent, motherName: e.target.value })}
                                                        />
                                                        <InputField
                                                            label="8.1.5 Father's Name"
                                                            value={currentStudent.fatherName}
                                                            onChange={(e) => setCurrentStudent({ ...currentStudent, fatherName: e.target.value })}
                                                        />
                                                        <InputField
                                                            label="8.1.6 Guardian's Name"
                                                            value={currentStudent.guardianName}
                                                            onChange={(e) => setCurrentStudent({ ...currentStudent, guardianName: e.target.value })}
                                                        />
                                                        <InputField
                                                            label="8.1.7 Aadhaar Number"
                                                            value={currentStudent.aadhaarNumber}
                                                            onChange={(e) => setCurrentStudent({ ...currentStudent, aadhaarNumber: e.target.value })}
                                                            placeholder="12-digit number"
                                                        />
                                                        <InputField
                                                            label="8.1.8 Name as per Aadhaar"
                                                            value={currentStudent.aadhaarName}
                                                            onChange={(e) => setCurrentStudent({ ...currentStudent, aadhaarName: e.target.value })}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Contact Group */}
                                                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
                                                    <h4 className="font-bold text-sm text-primary-800 uppercase tracking-widest border-b border-neutral-100 pb-2">PART B: CONTACT DETAILS</h4>
                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        <div className="md:col-span-2">
                                                            <InputField
                                                                label="8.1.9 Address"
                                                                value={currentStudent.address}
                                                                onChange={(e) => setCurrentStudent({ ...currentStudent, address: e.target.value })}
                                                                placeholder="Village/Ward/Street..."
                                                            />
                                                        </div>
                                                        <InputField label="8.1.10 Pincode" value={currentStudent.pincode} onChange={(e) => setCurrentStudent({ ...currentStudent, pincode: e.target.value })} />
                                                        <InputField label="8.1.11 Mobile Number" type="tel" value={currentStudent.mobile} onChange={(e) => setCurrentStudent({ ...currentStudent, mobile: e.target.value })} />
                                                        <InputField label="8.1.12 Alt Mobile" type="tel" value={currentStudent.alternateMobile} onChange={(e) => setCurrentStudent({ ...currentStudent, alternateMobile: e.target.value })} />
                                                        <InputField label="8.1.13 Email" type="email" value={currentStudent.email} onChange={(e) => setCurrentStudent({ ...currentStudent, email: e.target.value })} />
                                                    </div>
                                                </div>

                                                {/* Category Group */}
                                                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
                                                    <h4 className="font-bold text-sm text-primary-800 uppercase tracking-widest border-b border-neutral-100 pb-2">PART C: CATEGORY & ELIGIBILITY</h4>
                                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                        <SelectField label="8.1.14 Mother Tongue" value={currentStudent.motherTongue} onChange={(e) => setCurrentStudent({ ...currentStudent, motherTongue: e.target.value })} options={LANGUAGES_126} />
                                                        <SelectField label="8.1.15 Social Category" value={currentStudent.socialCategory} onChange={(e) => setCurrentStudent({ ...currentStudent, socialCategory: e.target.value })} options={["1-General", "2-SC", "3-ST", "4-OBC"]} />
                                                        <SelectField label="8.1.16 Minority Group" value={currentStudent.minorityGroup} onChange={(e) => setCurrentStudent({ ...currentStudent, minorityGroup: e.target.value })} options={MINORITY_GROUPS} />

                                                        <SelectField label="8.1.17 Is BPL Beneficiary?" value={currentStudent.isBPL} onChange={(e) => setCurrentStudent({ ...currentStudent, isBPL: e.target.value })} options={["1-Yes", "2-No"]} />
                                                        {currentStudent.isBPL === "1-Yes" && (
                                                            <SelectField label="8.1.17(a) Is AAY Beneficiary?" value={currentStudent.isAAY} onChange={(e) => setCurrentStudent({ ...currentStudent, isAAY: e.target.value })} options={["1-Yes", "2-No"]} />
                                                        )}

                                                        <SelectField label="8.1.18 Is EWS/Disadvantaged?" value={currentStudent.isEWS} onChange={(e) => setCurrentStudent({ ...currentStudent, isEWS: e.target.value })} options={["1-Yes", "2-No"]} />
                                                    </div>
                                                </div>

                                                {/* CWSN Group */}
                                                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
                                                    <h4 className="font-bold text-sm text-primary-800 uppercase tracking-widest border-b border-neutral-100 pb-2">PART D: SPECIAL NEEDS (CWSN)</h4>
                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        <SelectField label="8.1.19 Whether CWSN?" value={currentStudent.isCWSN} onChange={(e) => setCurrentStudent({ ...currentStudent, isCWSN: e.target.value })} options={["1-Yes", "2-No"]} />
                                                        {currentStudent.isCWSN === "1-Yes" && (
                                                            <>
                                                                <SelectField label="8.1.19(a) Impairment Type" value={currentStudent.impairmentType} onChange={(e) => setCurrentStudent({ ...currentStudent, impairmentType: e.target.value })} options={DISABILITY_TYPES_3211} />
                                                                <SelectField label="8.1.19(b) Disability Certificate?" value={currentStudent.hasDisabilityCertificate} onChange={(e) => setCurrentStudent({ ...currentStudent, hasDisabilityCertificate: e.target.value })} options={["1-Yes", "2-No"]} />
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Section 4.2: Enrolment Details Group */}
                                                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
                                                    <h4 className="font-bold text-sm text-primary-800 uppercase tracking-widest border-b border-neutral-100 pb-2">8.2 ENROLMENT DETAILS (CURRENT YEAR)</h4>
                                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                        <InputField label="Academic Year" value={currentStudent.academicYear} disabled />
                                                        <InputField label="UDISE Code" value={currentStudent.schoolUdiseCode} onChange={(e) => setCurrentStudent({ ...currentStudent, schoolUdiseCode: e.target.value })} placeholder="School UDISE Code" />
                                                        <InputField label="Student National Code" value={currentStudent.studentNationalCode} onChange={(e) => setCurrentStudent({ ...currentStudent, studentNationalCode: e.target.value })} placeholder="National Code" />

                                                        <SelectField
                                                            label="Grade/Class"
                                                            value={currentStudent.studentGrade}
                                                            onChange={(e) => setCurrentStudent({ ...currentStudent, studentGrade: e.target.value })}
                                                            options={sectionConfigs.map(c => c.className)}
                                                        />
                                                        <InputField label="Section" value={currentStudent.studentSection} onChange={(e) => setCurrentStudent({ ...currentStudent, studentSection: e.target.value })} placeholder="A, B, C..." />
                                                        <InputField label="Roll Number" value={currentStudent.rollNumber} onChange={(e) => setCurrentStudent({ ...currentStudent, rollNumber: e.target.value })} />

                                                        <InputField label="8.2.1 Admission Number" value={currentStudent.admissionNumber} onChange={(e) => setCurrentStudent({ ...currentStudent, admissionNumber: e.target.value })} />
                                                        <InputField label="8.2.2 Admission Date" type="date" value={currentStudent.admissionDate} onChange={(e) => setCurrentStudent({ ...currentStudent, admissionDate: e.target.value })} />
                                                        <SelectField label="8.2.3(a) Medium of Instruction" value={currentStudent.instructionMedium} onChange={(e) => setCurrentStudent({ ...currentStudent, instructionMedium: e.target.value })} options={LANGUAGES_126} />

                                                        <InputField label="8.2.3(b) Language Group Studied" value={currentStudent.languageGroup} onChange={(e) => setCurrentStudent({ ...currentStudent, languageGroup: e.target.value })} placeholder="1st:Hindi, 2nd:English..." />

                                                        {/* Higher Secondary Only */}
                                                        {(currentStudent.studentGrade === "11" || currentStudent.studentGrade === "12") && (
                                                            <SelectField label="8.2.4 Academic Stream" value={currentStudent.academicStream} onChange={(e) => setCurrentStudent({ ...currentStudent, academicStream: e.target.value })} options={ACADEMIC_STREAMS} />
                                                        )}

                                                        <SelectField label="8.2.5(a) Prev Year Status" value={currentStudent.prevYearStatus} onChange={(e) => setCurrentStudent({ ...currentStudent, prevYearStatus: e.target.value })} options={PREVIOUS_YEAR_STATUS} />

                                                        {(currentStudent.prevYearStatus === "1-Studied at Current/Same School" || currentStudent.prevYearStatus === "2-Studied at Other School") && (
                                                            <SelectField label="8.2.5(b) Prev Year Grade" value={currentStudent.prevYearGrade} onChange={(e) => setCurrentStudent({ ...currentStudent, prevYearGrade: e.target.value })} options={sectionConfigs.map(c => c.className)} />
                                                        )}

                                                        {(() => {
                                                            const gradeNum = parseInt(currentStudent.studentGrade);
                                                            const isPrimaryOrMiddle = !isNaN(gradeNum) && gradeNum <= 8;
                                                            const isPrePrimary = ["Nursery", "LKG", "UKG"].includes(currentStudent.studentGrade);

                                                            if (isPrimaryOrMiddle || isPrePrimary) {
                                                                return (
                                                                    <>
                                                                        <SelectField label="8.2.6(a) Admitted under RTE?" value={currentStudent.isAdmittedRTE} onChange={(e) => setCurrentStudent({ ...currentStudent, isAdmittedRTE: e.target.value })} options={["1-Yes", "2-No"]} />
                                                                        {currentStudent.isAdmittedRTE === "1-Yes" && (
                                                                            <InputField label="8.2.6(b) RTE Amount Claimed" type="number" value={currentStudent.rteAmountClaimed} onChange={(e) => setCurrentStudent({ ...currentStudent, rteAmountClaimed: e.target.value })} />
                                                                        )}
                                                                    </>
                                                                );
                                                            }
                                                            return null;
                                                        })()}
                                                    </div>

                                                    <div className="pt-4 border-t border-neutral-100 flex flex-wrap gap-x-8 gap-y-6">
                                                        <div className="flex-1 min-w-[200px]">
                                                            <SelectField label="8.2.7(a) Prev Class Result" value={currentStudent.prevClassResult} onChange={(e) => setCurrentStudent({ ...currentStudent, prevClassResult: e.target.value })} options={PREV_CLASS_RESULT} />
                                                        </div>
                                                        <div className="w-48">
                                                            <InputField label="8.2.7(b) % of Marks" type="number" value={currentStudent.prevClassMarks} onChange={(e) => setCurrentStudent({ ...currentStudent, prevClassMarks: e.target.value })} placeholder="85.5" />
                                                        </div>
                                                        <div className="w-48">
                                                            <InputField label="8.2.8 Attendance Days" type="number" value={currentStudent.prevYearAttendance} onChange={(e) => setCurrentStudent({ ...currentStudent, prevYearAttendance: e.target.value })} placeholder="210" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Section 4.3: Facility & Other Details */}
                                                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
                                                    <h4 className="font-bold text-sm text-primary-800 uppercase tracking-widest border-b border-neutral-100 pb-2">8.3 FACILITY AND OTHER DETAILS</h4>

                                                    <div className="space-y-6">
                                                        <div className="grid md:grid-cols-2 gap-6">
                                                            <SelectField label="8.3.1 Facilities provided to student?" value={currentStudent.hasFacilities} onChange={(e) => setCurrentStudent({ ...currentStudent, hasFacilities: e.target.value })} options={["1-Yes", "2-No"]} />
                                                            {currentStudent.hasFacilities === "1-Yes" && (
                                                                <div className="md:col-span-2 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                                                                    <p className="text-xs font-bold text-neutral-500 mb-3 uppercase tracking-wider">Select Facilities Received:</p>
                                                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                                                        {GENERAL_FACILITIES.map(fac => (
                                                                            <label key={fac} className="flex items-center gap-2 cursor-pointer group">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={currentStudent.facilitiesReceived.includes(fac)}
                                                                                    onChange={(e) => {
                                                                                        const newList = e.target.checked
                                                                                            ? [...currentStudent.facilitiesReceived, fac]
                                                                                            : currentStudent.facilitiesReceived.filter(f => f !== fac);
                                                                                        setCurrentStudent({ ...currentStudent, facilitiesReceived: newList });
                                                                                    }}
                                                                                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                                                                                />
                                                                                <span className="text-xs text-neutral-600 group-hover:text-neutral-900 transition-colors uppercase font-medium">{fac.split('-')[1]}</span>
                                                                            </label>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-neutral-50">
                                                            <SelectField label="8.3.2 CWSN Facilities provided?" value={currentStudent.hasCWSNFacilities} onChange={(e) => setCurrentStudent({ ...currentStudent, hasCWSNFacilities: e.target.value })} options={["1-Yes", "2-No"]} />
                                                            {currentStudent.hasCWSNFacilities === "1-Yes" && (
                                                                <div className="md:col-span-2 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                                                                    <p className="text-xs font-bold text-neutral-500 mb-3 uppercase tracking-wider">Select CWSN Facilities:</p>
                                                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                                                        {CWSN_FACILITIES.map(fac => (
                                                                            <label key={fac} className="flex items-center gap-2 cursor-pointer group">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    checked={currentStudent.cwsnFacilitiesReceived.includes(fac)}
                                                                                    onChange={(e) => {
                                                                                        const newList = e.target.checked
                                                                                            ? [...currentStudent.cwsnFacilitiesReceived, fac]
                                                                                            : currentStudent.cwsnFacilitiesReceived.filter(f => f !== fac);
                                                                                        setCurrentStudent({ ...currentStudent, cwsnFacilitiesReceived: newList });
                                                                                    }}
                                                                                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                                                                                />
                                                                                <span className="text-xs text-neutral-600 group-hover:text-neutral-900 transition-colors uppercase font-medium">{fac.split('-')[1]}</span>
                                                                            </label>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-neutral-50">
                                                            <div className="space-y-4">
                                                                <SelectField label="8.3.3 Screened for SLD?" value={currentStudent.screenedSLD} onChange={(e) => setCurrentStudent({ ...currentStudent, screenedSLD: e.target.value })} options={["1-Yes", "2-No"]} />
                                                                {currentStudent.screenedSLD === "1-Yes" && (
                                                                    <SelectField label="Specify SLD Type" value={currentStudent.sldType} onChange={(e) => setCurrentStudent({ ...currentStudent, sldType: e.target.value })} options={SLD_TYPES} />
                                                                )}
                                                            </div>
                                                            <SelectField label="8.3.4 Screened for ASD?" value={currentStudent.screenedASD} onChange={(e) => setCurrentStudent({ ...currentStudent, screenedASD: e.target.value })} options={["1-Yes", "2-No"]} />
                                                            <SelectField label="8.3.5 Screened for ADHD?" value={currentStudent.screenedADHD} onChange={(e) => setCurrentStudent({ ...currentStudent, screenedADHD: e.target.value })} options={["1-Yes", "2-No"]} />

                                                            <SelectField label="8.3.6 Identified as Gifted?" value={currentStudent.isGifted} onChange={(e) => setCurrentStudent({ ...currentStudent, isGifted: e.target.value })} options={["1-Yes", "2-No"]} />
                                                            <SelectField label="8.3.7 State/National Competition?" value={currentStudent.appearedCompetitions} onChange={(e) => setCurrentStudent({ ...currentStudent, appearedCompetitions: e.target.value })} options={["1-Yes", "2-No"]} />
                                                            <SelectField label="8.3.8 Participation in NCC/NSS?" value={currentStudent.participatesNCC} onChange={(e) => setCurrentStudent({ ...currentStudent, participatesNCC: e.target.value })} options={["1-Yes", "2-No"]} />

                                                            <SelectField label="8.3.9 Handle Digital Devices?" value={currentStudent.digitalCapable} onChange={(e) => setCurrentStudent({ ...currentStudent, digitalCapable: e.target.value })} options={["1-Yes", "2-No"]} />
                                                            <InputField label="8.3.10(a) Height (in CMs)" type="number" value={currentStudent.height} onChange={(e) => setCurrentStudent({ ...currentStudent, height: e.target.value })} placeholder="120" />
                                                            <InputField label="8.3.10(b) Weight (in KGs)" type="number" value={currentStudent.weight} onChange={(e) => setCurrentStudent({ ...currentStudent, weight: e.target.value })} placeholder="25" />

                                                            <SelectField label="8.3.11 Distance to School" value={currentStudent.distanceToSchool} onChange={(e) => setCurrentStudent({ ...currentStudent, distanceToSchool: e.target.value })} options={RESIDENCE_DISTANCE} />
                                                            <SelectField label="8.3.12 Guardian Education" value={currentStudent.guardianEducation} onChange={(e) => setCurrentStudent({ ...currentStudent, guardianEducation: e.target.value })} options={GUARDIAN_EDUCATION} />
                                                            <SelectField label="Blood Group" value={currentStudent.bloodGroup} onChange={(e) => setCurrentStudent({ ...currentStudent, bloodGroup: e.target.value })} options={BLOOD_GROUPS} />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Section 4.4: Vocational Education */}
                                                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
                                                    <h4 className="font-bold text-sm text-primary-800 uppercase tracking-widest border-b border-neutral-100 pb-2">8.4 VOCATIONAL EDUCATION DETAILS</h4>
                                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                        <SelectField label="4.4.1 Undertook vocational course?" value={currentStudent.undertookVocational} onChange={(e) => setCurrentStudent({ ...currentStudent, undertookVocational: e.target.value })} options={["1-Yes", "2-No"]} />

                                                        {currentStudent.undertookVocational === "1-Yes" && (
                                                            <>
                                                                <InputField label="4.4.2 (a) Trade/Sector" value={currentStudent.vocationalTrade} onChange={(e) => setCurrentStudent({ ...currentStudent, vocationalTrade: e.target.value })} placeholder="Enter Trade Code/Name" />
                                                                <InputField label="4.4.2 (b) Job Role" value={currentStudent.vocationalJobRole} onChange={(e) => setCurrentStudent({ ...currentStudent, vocationalJobRole: e.target.value })} placeholder="Enter Job Role Code" />
                                                                <SelectField label="4.4.3 Prev Class Vocational Exam" value={currentStudent.vocationalPrevClassExam} onChange={(e) => setCurrentStudent({ ...currentStudent, vocationalPrevClassExam: e.target.value })} options={VOCATIONAL_EXAM_STATUS} />
                                                                {(currentStudent.vocationalPrevClassExam === "1-Appeared and Passed" || currentStudent.vocationalPrevClassExam === "2-Appeared and Not Passed") && (
                                                                    <InputField label="% Marks in Vocational Subject" type="number" value={currentStudent.vocationalPrevClassMarks} onChange={(e) => setCurrentStudent({ ...currentStudent, vocationalPrevClassMarks: e.target.value })} placeholder="e.g. 75" />
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Section 4.5: Current Year Assessment */}
                                                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
                                                    <h4 className="font-bold text-sm text-primary-800 uppercase tracking-widest border-b border-neutral-100 pb-2">4.5 ASSESSMENT & ATTENDANCE (AY 2025-26)</h4>
                                                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl mb-4">
                                                        <p className="text-xs text-blue-700 font-medium flex items-center gap-2">
                                                            <span className="text-sm">ℹ️</span> To be captured at the end of Academic Year 2025-26
                                                        </p>
                                                    </div>
                                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                        <SelectField label="4.5.1 (a) Current Year Result" value={currentStudent.currentYearResult} onChange={(e) => setCurrentStudent({ ...currentStudent, currentYearResult: e.target.value })} options={CURRENT_YEAR_RESULT} />
                                                        <InputField label="4.5.1 (b) % Marks Obtained" type="number" value={currentStudent.currentYearMarks} onChange={(e) => setCurrentStudent({ ...currentStudent, currentYearMarks: e.target.value })} placeholder="88.2" />
                                                        <InputField label="4.5.2 Attendance Days" type="number" value={currentStudent.currentYearAttendance} onChange={(e) => setCurrentStudent({ ...currentStudent, currentYearAttendance: e.target.value })} placeholder="195" />
                                                    </div>
                                                </div>

                                                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                                                    <p className="text-xs text-neutral-500 italic">
                                                        <strong>Note:</strong> For students without Aadhaar, enter <strong>'9999 9999 9999'</strong> (12 times 9) as per UDISE+ guidelines.
                                                    </p>
                                                </div>

                                                <div className="flex gap-4 justify-end pt-8 border-t border-neutral-100">
                                                    <button
                                                        onClick={() => setIsAddingStudent(false)}
                                                        className="px-6 py-3 rounded-2xl text-sm font-bold border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-all hover:shadow-sm"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handleSaveStudent}
                                                        className="px-10 py-3 rounded-2xl text-sm font-bold bg-primary-600 text-white hover:bg-primary-700 shadow-xl shadow-primary-600/20 transition-all active:scale-95"
                                                    >
                                                        {editingStudentId ? "Update Profile" : "Enroll Student"}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )
                }

                {/* Step 8: Vocational Education */}
                {
                    currentStep === 8 && (
                        <div className="space-y-8">
                            {isVocational !== "1-Yes" ? (
                                <div className="bg-white p-8 text-center rounded-2xl border border-neutral-200 shadow-sm">
                                    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl">ℹ️</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-neutral-800 mb-2">Not Applicable</h3>
                                    <p className="text-neutral-500 max-w-md mx-auto">
                                        The Vocational Education section is only required for schools that have declared they provide vocational courses under NSQF (Question 1.30 in Basic Details).
                                    </p>
                                    <button
                                        onClick={prev}
                                        className="mt-6 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl hover:bg-neutral-200 transition-colors text-sm font-medium"
                                    >
                                        Go Back
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
                                        <h3 className="text-lg font-semibold text-neutral-800 pb-2 border-b border-neutral-100">
                                            Section 9: Vocational Education & Industry Engagement (under NSQF)
                                        </h3>
                                        <div className="grid md:grid-cols-3 gap-5">
                                            <InputField
                                                label="9.1 Number of Guest Lecturers conducted"
                                                type="number"
                                                value={vocationalGuestLecturers}
                                                onChange={(e) => setVocationalGuestLecturers(e.target.value)}
                                                placeholder="e.g. 5"
                                            />
                                            <InputField
                                                label="9.2 Number of industry visits organized"
                                                type="number"
                                                value={vocationalIndustryVisits}
                                                onChange={(e) => setVocationalIndustryVisits(e.target.value)}
                                                placeholder="e.g. 2"
                                            />
                                            <InputField
                                                label="9.3 Number of Industries Linkages"
                                                type="number"
                                                value={vocationalIndustryLinkages}
                                                onChange={(e) => setVocationalIndustryLinkages(e.target.value)}
                                                placeholder="e.g. 3"
                                            />
                                        </div>
                                        {applicationType === "Renewal" &&
                                            (!vocationalGuestLecturers || vocationalGuestLecturers === "0") &&
                                            (!vocationalIndustryVisits || vocationalIndustryVisits === "0") &&
                                            (!vocationalIndustryLinkages || vocationalIndustryLinkages === "0") && (
                                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl mt-4">
                                                    <p className="text-xs font-bold text-red-700">
                                                        ❌ Quality Concern: Vocational courses are only effective with industry interaction. Zero engagement reported.
                                                    </p>
                                                </div>
                                            )}
                                        {applicationType === "Upgradation" && (
                                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl mt-4">
                                                <p className="text-xs text-blue-800">
                                                    <span className="font-bold">Upgradation Note:</span> If adding a new vocational sector, declare &quot;Proposed Industry Linkages&quot; in (c) to show your training plan.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Placements (e) */}
                                    <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
                                        <h3 className="text-lg font-semibold text-neutral-800 pb-2 border-b border-neutral-100">
                                            9.4 Details of Placements and Employment in Previous Academic Year
                                        </h3>
                                        {applicationType === "New Recognition" ? (
                                            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-center">
                                                <p className="text-sm text-neutral-600 italic">Not applicable for New Recognition applications as there is no &quot;Previous Academic Year&quot;.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-8">
                                                {/* Class 10 */}
                                                <div>
                                                    <h4 className="font-semibold text-neutral-700 mb-4">Class 10 Outcomes</h4>
                                                    <div className="grid md:grid-cols-4 gap-4">
                                                        <InputField label="i) Enrolled" type="number" value={placEnrolled10} onChange={(e) => setPlacEnrolled10(e.target.value)} placeholder="0" />
                                                        <InputField label="ii) Passed/Certified" type="number" value={placPassed10} onChange={(e) => setPlacPassed10(e.target.value)} placeholder="0" />
                                                        <InputField label="iii) Self-employed" type="number" value={placSelfEmp10} onChange={(e) => setPlacSelfEmp10(e.target.value)} placeholder="0" />
                                                        <InputField label="iv) Placed/Apprenticeship" type="number" value={placPlaced10} onChange={(e) => setPlacPlaced10(e.target.value)} placeholder="0" />
                                                    </div>
                                                    {parseInt(placPassed10 || "0") > parseInt(placEnrolled10 || "0") && (
                                                        <p className="text-xs text-red-600 font-bold mt-2">Error: Passed students cannot exceed Enrolled students.</p>
                                                    )}
                                                    {parseInt(placPlaced10 || "0") > parseInt(placPassed10 || "0") && (
                                                        <p className="text-xs text-red-600 font-bold mt-1">Error: Placed students cannot exceed Passed/Certified students.</p>
                                                    )}
                                                </div>

                                                {/* Class 12 */}
                                                <div>
                                                    <h4 className="font-semibold text-neutral-700 mb-4 border-t border-neutral-100 pt-4">Class 12 Outcomes</h4>
                                                    <div className="grid md:grid-cols-4 gap-4">
                                                        <InputField label="v) Enrolled" type="number" value={placEnrolled12} onChange={(e) => setPlacEnrolled12(e.target.value)} placeholder="0" />
                                                        <InputField label="vi) Passed/Certified" type="number" value={placPassed12} onChange={(e) => setPlacPassed12(e.target.value)} placeholder="0" />
                                                        <InputField label="vii) Self-employed" type="number" value={placSelfEmp12} onChange={(e) => setPlacSelfEmp12(e.target.value)} placeholder="0" />
                                                        <InputField label="viii) Placed/Apprenticeship" type="number" value={placPlaced12} onChange={(e) => setPlacPlaced12(e.target.value)} placeholder="0" />
                                                    </div>
                                                    {parseInt(placPassed12 || "0") > parseInt(placEnrolled12 || "0") && (
                                                        <p className="text-xs text-red-600 font-bold mt-2">Error: Passed students cannot exceed Enrolled students.</p>
                                                    )}
                                                    {parseInt(placPlaced12 || "0") > parseInt(placPassed12 || "0") && (
                                                        <p className="text-xs text-red-600 font-bold mt-1">Error: Placed students cannot exceed Passed/Certified students.</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Vocational Labs */}
                                    <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-6">
                                        <h3 className="text-lg font-semibold text-neutral-800 pb-2 border-b border-neutral-100">
                                            9.5 Availability of Vocational Lab
                                        </h3>
                                        {applicationType === "New Recognition" && (
                                            <div className="p-3 bg-primary-50 border border-primary-200 rounded-xl mb-4 text-xs text-primary-800">
                                                <span className="font-bold">Mandatory for New Recognition:</span> Prove you have at least a &quot;1-Fully Equipped&quot; or &quot;2-Partially Equipped&quot; lab for proposed sectors.
                                            </div>
                                        )}
                                        {applicationType === "Upgradation" && (
                                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl mb-4 text-xs text-blue-800">
                                                <span className="font-bold">Upgradation Note:</span> If upgrading to a new vocational stream, prove you have a &quot;Separate Room&quot; (1-Yes) available for the new lab.
                                            </div>
                                        )}

                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse border border-neutral-200 text-sm">
                                                <thead>
                                                    <tr className="bg-neutral-50 text-neutral-700">
                                                        <th className="border border-neutral-200 p-3 text-center w-24">Sector</th>
                                                        <th className="border border-neutral-200 p-3 text-left">Availability with Present Condition?</th>
                                                        <th className="border border-neutral-200 p-3 text-center w-48">Separate Room available?</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {vocationalLabs.map((lab, idx) => (
                                                        <tr key={idx} className="bg-white hover:bg-neutral-50">
                                                            <td className="border border-neutral-200 p-2 text-center font-medium text-neutral-600">{lab.sector}</td>
                                                            <td className="border border-neutral-200 p-1">
                                                                <select
                                                                    className="w-full bg-transparent p-1.5 focus:outline-none text-neutral-700 cursor-pointer"
                                                                    value={lab.condition}
                                                                    suppressHydrationWarning
                                                                    onChange={(e) => {
                                                                        const newLabs = [...vocationalLabs];
                                                                        newLabs[idx].condition = e.target.value;
                                                                        setVocationalLabs(newLabs);
                                                                    }}
                                                                >
                                                                    <option value="">Select Condition</option>
                                                                    <option value="1-Fully Equipped">1-Fully Equipped</option>
                                                                    <option value="2-Partially Equipped">2-Partially Equipped</option>
                                                                    <option value="3-Not Equipped">3-Not Equipped</option>
                                                                    <option value="4-Lab Not Available">4-Lab Not Available</option>
                                                                </select>
                                                            </td>
                                                            <td className="border border-neutral-200 p-1">
                                                                <select
                                                                    className="w-full bg-transparent p-1.5 focus:outline-none text-center text-neutral-700 cursor-pointer"
                                                                    value={lab.separateRoom}
                                                                    suppressHydrationWarning
                                                                    onChange={(e) => {
                                                                        const newLabs = [...vocationalLabs];
                                                                        newLabs[idx].separateRoom = e.target.value;
                                                                        setVocationalLabs(newLabs);
                                                                    }}
                                                                >
                                                                    <option value="">Select</option>
                                                                    <option value="1-Yes">1-Yes</option>
                                                                    <option value="2-No">2-No</option>
                                                                </select>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {vocationalLabs.some(l => l.condition === "1-Fully Equipped" || l.condition === "2-Partially Equipped" || l.separateRoom === "1-Yes") && (
                                            <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100 animate-in fade-in slide-in-from-top-2">
                                                <UploadField label="Upload Lab Photos / Equipment List (Required to verify lab availability)" />
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )
                }

                {/* Navigation Buttons */}
                <div className="flex flex-wrap items-center justify-between mt-8 pt-6 border-t border-neutral-100 gap-3">
                    <button
                        suppressHydrationWarning
                        onClick={prev}
                        disabled={currentStep === 0 || isSaving}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <FiChevronLeft size={16} /> Previous
                    </button>

                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-colors">
                            <FiSave size={16} /> Save
                        </button>

                        {currentStep === steps.length - 1 ? (
                            <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-colors">
                                <FiSend size={16} /> Submit
                            </button>
                        ) : (
                            <button
                                suppressHydrationWarning
                                onClick={next}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-600/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? (
                                    <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                                ) : null}
                                {isSaving ? "Saving…" : "Next"} {!isSaving && <FiChevronRight size={16} />}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout >
    );
}

/* ---------- Reusable sub-components ---------- */

function InputField({
    label,
    type = "text",
    placeholder = "",
    value,
    onChange,
    disabled = false,
    required = false
}: {
    label: string;
    type?: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    required?: boolean;
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
                suppressHydrationWarning
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-neutral-50 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
        </div>
    );
}

function SelectField({
    label,
    options,
    value,
    onChange,
    disabled = false,
    required = false
}: {
    label: string;
    options: string[];
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    disabled?: boolean;
    required?: boolean;
}) {
    return (
        <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
                suppressHydrationWarning
                value={value}
                onChange={onChange}
                disabled={disabled}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-neutral-50 focus:bg-white appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <option value="">{disabled ? `Select group first` : `Select ${label}`}</option>
                {options.map((o) => (
                    <option key={o} value={o}>{o}</option>
                ))}
            </select>
        </div>
    );
}

function UploadField({ label }: { label: string }) {
    return (
        <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">{label}</label>
            <div className="flex items-center justify-center w-full h-24 border-2 border-dashed border-neutral-200 rounded-xl hover:border-primary-400 transition-colors cursor-pointer bg-neutral-50 hover:bg-primary-50/50">
                <div className="text-center">
                    <FiUpload className="mx-auto text-neutral-400 mb-1" size={20} />
                    <p className="text-xs text-neutral-500">Click to upload or drag & drop</p>
                    <p className="text-xs text-neutral-400">PDF, JPG, PNG (Max 5MB)</p>
                </div>
            </div>
        </div>
    );
}

function SearchableMultiSelect({
    label,
    options,
    selected,
    onChange,
    placeholder = "Search and select..."
}: {
    label: string;
    options: string[];
    selected: string[];
    onChange: (items: string[]) => void;
    placeholder?: string;
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const filteredOptions = options.filter(opt =>
        opt.toLowerCase().includes(searchTerm.toLowerCase()) && !selected.includes(opt)
    ).slice(0, 10);

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">{label}</label>
            <div className="min-h-[45px] p-2 rounded-xl border border-neutral-200 bg-neutral-50 flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-primary-500 focus-within:bg-white transition-all">
                {selected.map(item => (
                    <span key={item} className="flex items-center gap-1.5 px-2 py-1 bg-primary-100 text-primary-700 rounded-lg text-[11px] font-bold border border-primary-200">
                        {item}
                        <button type="button" onClick={() => onChange(selected.filter(i => i !== item))} className="hover:text-primary-900 text-sm">×</button>
                    </span>
                ))}
                <input
                    type="text"
                    value={searchTerm}
                    onFocus={() => setIsOpen(true)}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={selected.length === 0 ? placeholder : ""}
                    className="flex-1 bg-transparent border-none outline-none text-sm p-1 min-w-[120px]"
                />
            </div>
            {isOpen && searchTerm && (
                <div className="absolute z-[100] w-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {filteredOptions.length > 0 ? (
                        <div className="max-h-60 overflow-y-auto">
                            {filteredOptions.map(opt => (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => {
                                        onChange([...selected, opt]);
                                        setSearchTerm("");
                                        setIsOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-primary-50 border-b border-neutral-50 last:border-0 transition-colors"
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="px-4 py-3 text-sm text-neutral-400 italic">No results found</div>
                    )}
                </div>
            )}
            {isOpen && <div className="fixed inset-0 z-[90]" onClick={() => setIsOpen(false)}></div>}
        </div>
    );
}