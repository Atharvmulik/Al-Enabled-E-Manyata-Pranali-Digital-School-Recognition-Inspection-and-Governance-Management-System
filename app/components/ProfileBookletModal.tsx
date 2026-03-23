"use client";

import React, { useState } from "react";
import { 
    X, Building2, Receipt, Scale, MapPin, Wrench, Users, 
    ShieldAlert, GraduationCap, BookOpen, Bus, CheckCircle2 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileBookletModalProps {
    isOpen: boolean;
    onClose: () => void;
    schoolName: string;
    udiseCode: string;
    mode?: "view" | "verify";
}

const mockData = {
    basic: {
        identity: [
            { label: "School Name", value: "Public High School" },
            { label: "UDISE Number", value: "09120304101" },
            { label: "Year of Establishment", value: "1995" },
            { label: "Board Affiliation", value: "State Board" },
            { label: "Application Type", value: "Renewal" },
            { label: "School Classification", value: "Co-Educational" },
        ],
        contact: [
            { label: "STD Code", value: "0522" },
            { label: "Landline Number", value: "2345678" },
            { label: "Mobile Number", value: "+91 9876543210" },
            { label: "Email", value: "contact@publichighschool.edu.in" },
            { label: "Website", value: "https://publichighschool.edu.in" },
        ],
        management: [
            { label: "Head of School (HoS) Name", value: "Dr. Rajesh Kumar" },
            { label: "HoS Mobile", value: "+91 9123456780" },
            { label: "Management Group", value: "B – Govt. Aided" },
            { label: "Management Code", value: "2 – Pvt. Aided" },
            { label: "Sub-Management", value: "State Government" },
            { label: "PM SHRI School", value: "Yes" },
            { label: "School Category", value: "3 – Higher Secondary (1 to 12)" },
            { label: "School Type", value: "3 – Co-Educational" },
            { label: "Location Type", value: "Urban" },
        ],
        classRange: [
            { label: "Lowest Class", value: "1" },
            { label: "Highest Class", value: "12" },
            { label: "Pre-Primary Section Attached?", value: "Yes" },
        ],
        curriculum: [
            { label: "Curriculum – Primary Level", value: "NCERT / CBSE" },
            { label: "Curriculum – Upper Primary Level", value: "NCERT / CBSE" },
        ],
        schoolProfile: [
            { label: "Is Minority School?", value: "No" },
            { label: "Is RTE Applicable?", value: "Yes" },
            { label: "Is Residential School?", value: "No" },
            { label: "Is Shift School?", value: "No" },
            { label: "Mother Tongue as Medium of Instruction?", value: "Yes" },
        ],
        distances: [
            { label: "Nearest Primary School Distance", value: "1.5 km" },
            { label: "Nearest Upper Primary School Distance", value: "2.0 km" },
            { label: "Nearest Secondary School Distance", value: "3.0 km" },
            { label: "Nearest Higher Secondary School Distance", value: "4.5 km" },
        ],
        operational: [
            { label: "Is All Weather Road Available?", value: "Yes" },
            { label: "Total Instructional Days (Academic Year)", value: "220" },
            { label: "CCE (Continuous & Comprehensive Evaluation)?", value: "Yes" },
            { label: "Student Records Maintained?", value: "Yes" },
            { label: "Records Shared with Parents?", value: "Yes" },
        ],
        anganwadi: [
            { label: "Anganwadi Centre Attached?", value: "Yes" },
            { label: "Number of Anganwadi Centres", value: "2" },
            { label: "Anganwadi Centre 1 – Code", value: "AW-LKN-0021" },
            { label: "Anganwadi Centre 1 – Name", value: "Gomti Nagar ICDS Centre" },
            { label: "Anganwadi Centre 1 – Boys", value: "18" },
            { label: "Anganwadi Centre 1 – Girls", value: "22" },
            { label: "Balavatika Under NEP Available?", value: "Yes" },
        ],
        specialPrograms: [
            { label: "Out of School Children (OoSC) Enrolled?", value: "Yes" },
            { label: "OoSC from ST Community?", value: "No" },
            { label: "Students in Remedial Teaching", value: "45" },
            { label: "Students in Learning Enhancement Program", value: "80" },
        ],
        inspections: [
            { label: "Academic Inspections (Current Year)", value: "3" },
            { label: "CRC Coordinator Visits", value: "6" },
            { label: "BRC Coordinator Visits", value: "4" },
            { label: "District Level Officer Visits", value: "2" },
            { label: "Regional Level Officer Visits", value: "1" },
            { label: "Headquarters Level Visits", value: "1" },
        ],
        governance: [
            { label: "School Management Committee (SMC)?", value: "Yes" },
            { label: "School Dev. & Monitoring Committee (SDMC)?", value: "Yes" },
            { label: "SMC Meetings in Academic Year", value: "4" },
            { label: "SMC School Development Plan?", value: "Yes" },
            { label: "Year of SMC Plan Preparation", value: "2024" },
            { label: "School Building Committee?", value: "Yes" },
            { label: "Academic Committee?", value: "Yes" },
            { label: "Parent-Teacher Association (PTA)?", value: "Yes" },
            { label: "PTA Meetings in Academic Year", value: "3" },
        ],
        financial: [
            { label: "PFMS Registered?", value: "Yes" },
            { label: "PFMS ID", value: "PFMS/UP/2024/98765" },
        ],
        multiClass: [
            { label: "Multi-Class Teaching?", value: "No" },
        ],
        schoolComplex: [
            { label: "Part of School Complex?", value: "Yes" },
            { label: "Hub School?", value: "Yes" },
            { label: "Complex – Pre-Primary Schools", value: "2" },
            { label: "Complex – Primary Schools", value: "3" },
            { label: "Complex – Upper Primary Schools", value: "2" },
            { label: "Complex – Secondary Schools", value: "1" },
            { label: "Complex – Higher Secondary Schools", value: "1" },
            { label: "Complex – Total Schools", value: "9" },
        ],
        initiatives: [
            { label: "Ek Bharat Shreshtha Bharat (EBSB)?", value: "Yes" },
            { label: "Fit India School?", value: "Yes" },
            { label: "360° Holistic Progress Report Card?", value: "Yes" },
            { label: "Teacher Photos on School Notice Board?", value: "Yes" },
            { label: "Vidya Pravesh (NEP 3-month play-based module)?", value: "Yes" },
        ],
        pmPoshan: [
            { label: "PM POSHAN (Mid-Day Meal) – Total Days Served", value: "200" },
            { label: "PM POSHAN – Days per Week", value: "5" },
            { label: "PM POSHAN – Days per Month", value: "22" },
            { label: "PM POSHAN – Balavatika Coverage?", value: "Yes" },
        ],
        attendance: [
            { label: "Student Attendance – Capture Method", value: "Digital / App-based" },
            { label: "Teacher Attendance – Capture Method", value: "Biometric" },
        ],
        clubs: [
            { label: "Youth Club?", value: "Yes" },
            { label: "Eco Club?", value: "Yes" },
            { label: "Teacher ID Card Issued to All?", value: "Yes" },
            { label: "SSSA Certification", value: "Level 2 – Developing" },
        ],
    },
    receipts: {
        grants: [
            { label: "Composite School Grant – Received", value: "₹ 50,000" },
            { label: "Composite School Grant – Expended", value: "₹ 48,000" },
            { label: "Library Grant – Received", value: "₹ 15,000" },
            { label: "Library Grant – Expended", value: "₹ 15,000" },
            { label: "Grant for Major Repair – Received", value: "₹ 2,00,000" },
            { label: "Grant for Major Repair – Expended", value: "₹ 1,85,000" },
            { label: "Sports & Physical Education Grant – Received", value: "₹ 20,000" },
            { label: "Sports & Physical Education Grant – Expended", value: "₹ 18,500" },
            { label: "Media & Community Mobilization Grant – Received", value: "₹ 5,000" },
            { label: "Media & Community Mobilization Grant – Expended", value: "₹ 4,500" },
            { label: "SMC/SMDC Training Grant – Received", value: "₹ 8,000" },
            { label: "SMC/SMDC Training Grant – Expended", value: "₹ 7,200" },
            { label: "Preschool Level Support Grant – Received", value: "₹ 10,000" },
            { label: "Preschool Level Support Grant – Expended", value: "₹ 9,500" },
        ],
        assistance: [
            { label: "NGO Financial Assistance Received?", value: "Yes" },
            { label: "NGO Name", value: "Education for All Foundation" },
            { label: "NGO Assistance Amount", value: "₹ 2,50,000" },
            { label: "PSU Financial Assistance Received?", value: "Yes" },
            { label: "PSU Name", value: "State Power Corporation CSR" },
            { label: "PSU Assistance Amount", value: "₹ 1,00,000" },
            { label: "Community Assistance Received?", value: "No" },
            { label: "Other Assistance Received?", value: "No" },
        ],
        assets: [
            { label: "ICT Register Maintained?", value: "Yes" },
            { label: "ICT Register – Last Updated", value: "15-Jan-2025" },
            { label: "Sports Register Maintained?", value: "Yes" },
            { label: "Sports Register – Last Updated", value: "20-Dec-2024" },
            { label: "Library Register Maintained?", value: "Yes" },
            { label: "Library Register – Last Updated", value: "10-Feb-2025" },
        ],
        expenditure: [
            { label: "Annual Maintenance Expenditure", value: "₹ 3,50,000" },
            { label: "Teacher Salary Expenditure", value: "₹ 45,00,000" },
            { label: "Construction Expenditure", value: "₹ 5,00,000" },
            { label: "Other Expenditure", value: "₹ 1,20,000" },
        ],
    },
    legal: {
        details: [
            { label: "Trust/Society Name", value: "Public Education Trust" },
            { label: "Registration Number", value: "REG/2001/458" },
            { label: "Registration Date", value: "15-May-2001" },
            { label: "Has Minority Status?", value: "No" },
            { label: "Minority Community", value: "Not Applicable" },
        ],
        land: [
            { label: "Land Ownership", value: "Owned" },
            { label: "Total Land Area", value: "4,500 Sq. m" },
            { label: "Built-up Area", value: "2,800 Sq. m" },
            { label: "Land Available for Expansion?", value: "Yes" },
            { label: "Expansion Type", value: "Adjacent Plot" },
            { label: "Additional Classrooms Needed", value: "5" },
            { label: "Playground Available?", value: "Yes" },
            { label: "Playground Area", value: "1,200 Sq. m" },
            { label: "Alternate Playground Available?", value: "Yes" },
        ],
    },
    location: {
        address: [
            { label: "Address", value: "123, Vidya Marg, Gomti Nagar" },
            { label: "Pincode", value: "226010" },
            { label: "District", value: "Lucknow" },
            { label: "Taluka / Tehsil", value: "Lucknow City" },
            { label: "Revenue Block", value: "Lucknow Urban" },
            { label: "Village / Town Name", value: "Gomti Nagar" },
            { label: "Gram Panchayat", value: "N/A (Urban Area)" },
            { label: "Urban Local Body (ULB)", value: "Lucknow Municipal Corporation" },
            { label: "Ward Name / Number", value: "Ward 42 – Gomti Nagar" },
            { label: "CRC (Cluster Resource Centre)", value: "CRC Gomti Nagar Zone-A" },
            { label: "Assembly Constituency", value: "Lucknow East" },
            { label: "Parliamentary Constituency", value: "Lucknow" },
        ],
        geo: [
            { label: "Latitude", value: "26.8467° N" },
            { label: "Longitude", value: "80.9462° E" },
            { label: "Connectivity – All Weather Road?", value: "Yes" },
            { label: "Distance from Block HQ", value: "5 km" },
            { label: "Distance from District HQ", value: "8 km" },
        ],
    },
    infra: {
        buildings: [
            { label: "Building Status", value: "Private" },
            { label: "Active Building Blocks", value: "3" },
            { label: "Pucca Buildings", value: "2" },
            { label: "Partially Pucca Buildings", value: "1" },
            { label: "Kuchcha Buildings", value: "0" },
            { label: "Tent / Temporary Structures", value: "0" },
        ],
        storeys: [
            { label: "Single Storey Buildings", value: "0" },
            { label: "Double Storey Buildings", value: "1" },
            { label: "Three Storey Buildings", value: "2" },
            { label: "Multi Storey Buildings (>3)", value: "0" },
            { label: "Dilapidated Buildings", value: "0" },
            { label: "Buildings Under Construction", value: "0" },
        ],
        classrooms: [
            { label: "Pre-Primary Classrooms", value: "3" },
            { label: "Primary Classrooms (1-5)", value: "10" },
            { label: "Upper Primary Classrooms (6-8)", value: "8" },
            { label: "Secondary Classrooms (9-10)", value: "8" },
            { label: "Higher Secondary Classrooms (11-12)", value: "6" },
            { label: "Total Instructional Rooms", value: "35" },
            { label: "Classrooms Not in Use", value: "2" },
            { label: "Classrooms Under Construction", value: "1" },
            { label: "Classrooms in Dilapidated Condition", value: "0" },
        ],
        buildingCondition: [
            { label: "Pucca – Good Condition", value: "28" },
            { label: "Pucca – Minor Repair Needed", value: "3" },
            { label: "Pucca – Major Repair Needed", value: "1" },
            { label: "Partially Pucca – Good", value: "2" },
            { label: "Partially Pucca – Minor Repair", value: "1" },
            { label: "Partially Pucca – Major Repair", value: "0" },
            { label: "Boundary Wall Type", value: "Pucca (Complete)" },
        ],
        electricity: [
            { label: "Electricity Available?", value: "Yes" },
            { label: "Classrooms with Fans", value: "30" },
            { label: "Classrooms with ACs", value: "3" },
            { label: "Classrooms with Heaters", value: "0" },
            { label: "Solar Panel Installed?", value: "Yes" },
        ],
        rooms: [
            { label: "Principal's Room?", value: "Yes" },
            { label: "Vice Principal's Room?", value: "Yes" },
            { label: "Library Room?", value: "Yes" },
            { label: "Girls' Common Room?", value: "Yes" },
            { label: "Staff Room?", value: "Yes" },
            { label: "Co-Curricular / Activity Room?", value: "Yes" },
            { label: "Total Labs", value: "6" },
        ],
        sanitation: [
            { label: "Toilets Available?", value: "Yes" },
            { label: "Boys Toilets – Total", value: "12" },
            { label: "Boys Toilets – Functional", value: "11" },
            { label: "Boys Toilets – With Water", value: "11" },
            { label: "Girls Toilets – Total", value: "15" },
            { label: "Girls Toilets – Functional", value: "14" },
            { label: "Girls Toilets – With Water", value: "14" },
            { label: "CWSN Boys Toilets – Total", value: "2" },
            { label: "CWSN Boys Toilets – Functional", value: "2" },
            { label: "CWSN Girls Toilets – Total", value: "2" },
            { label: "CWSN Girls Toilets – Functional", value: "2" },
            { label: "Boys Urinals – Total", value: "8" },
            { label: "Girls Urinals – Total", value: "10" },
            { label: "Toilets Under Construction – Boys", value: "1" },
            { label: "Toilets Under Construction – Girls", value: "0" },
        ],
        hygiene: [
            { label: "Hand Washing Near Toilets?", value: "Yes" },
            { label: "Toilet Location", value: "Within School Premises" },
            { label: "Incinerator Available?", value: "Yes" },
            { label: "Sanitary Pad Vending Machine?", value: "Yes" },
            { label: "Hand Washing Before Meal?", value: "Yes" },
            { label: "Wash Points Count", value: "6" },
        ],
        water: [
            { label: "Hand Pump", value: "1" },
            { label: "Protected Well", value: "0" },
            { label: "Tap Water Supply", value: "Yes" },
            { label: "Packaged / Bottled Water", value: "No" },
            { label: "Water Purifier (RO/UV)?", value: "Yes" },
            { label: "Water Quality Tested?", value: "Yes" },
            { label: "Rain Water Harvesting?", value: "Yes" },
        ],
        library: [
            { label: "Library Available?", value: "Yes" },
            { label: "Total Library Books", value: "3,500" },
            { label: "Book Bank Available?", value: "Yes" },
            { label: "Book Bank Books", value: "500" },
            { label: "Reading Corner Available?", value: "Yes" },
            { label: "Reading Corner Books", value: "200" },
            { label: "Full-Time Librarian?", value: "Yes" },
            { label: "Subscribes to Newspapers / Magazines?", value: "Yes" },
            { label: "Library Books Borrowed (Annual)", value: "2,400" },
            { label: "Digital Library Available?", value: "Yes" },
            { label: "Digital Library Titles", value: "850" },
        ],
        health: [
            { label: "Annual Health Check-up Conducted?", value: "Yes" },
            { label: "No. of Health Checkups (Annual)", value: "3" },
            { label: "Parameters Checked – Height", value: "Yes" },
            { label: "Parameters Checked – Weight", value: "Yes" },
            { label: "Parameters Checked – Eyes", value: "Yes" },
            { label: "Parameters Checked – Dental", value: "Yes" },
            { label: "Parameters Checked – Throat", value: "Yes" },
            { label: "Deworming Tablets Given?", value: "Yes" },
            { label: "Iron & Folic Acid Tablets Given?", value: "Yes" },
            { label: "Health Records Maintained?", value: "Yes" },
            { label: "Thermal Scanner Available?", value: "Yes" },
            { label: "First Aid Kit Available?", value: "Yes" },
            { label: "Essential Medicines Available?", value: "Yes" },
        ],
        accessibility: [
            { label: "Ramp Available?", value: "Yes" },
            { label: "Hand Rails Available?", value: "Yes" },
            { label: "Special Educator Available?", value: "Yes" },
        ],
        facilities: [
            { label: "Kitchen Garden?", value: "Yes" },
            { label: "Kitchen Shed / Store?", value: "Yes" },
            { label: "Dustbins in Classrooms?", value: "Yes" },
            { label: "Dustbins near Toilets?", value: "Yes" },
            { label: "Dustbins in Kitchen?", value: "Yes" },
            { label: "Student Furniture Available?", value: "Yes" },
            { label: "Number of Students with Furniture", value: "1,200" },
        ],
        advanced: [
            { label: "Staff Quarters Available?", value: "Yes" },
            { label: "Atal Tinkering Lab (ATL)?", value: "Yes" },
            { label: "ATL ID", value: "ATL-UP-2023-1245" },
            { label: "Integrated Science Lab?", value: "Yes" },
        ],
        hostel: [
            { label: "Primary Hostel Available?", value: "No" },
            { label: "Upper Primary Hostel Available?", value: "No" },
            { label: "Secondary Hostel Available?", value: "Yes" },
            { label: "Secondary Hostel – Boys", value: "30" },
            { label: "Secondary Hostel – Girls", value: "25" },
            { label: "Higher Secondary Hostel Available?", value: "Yes" },
            { label: "Higher Sec. Hostel – Boys", value: "40" },
            { label: "Higher Sec. Hostel – Girls", value: "35" },
        ],
        labs: [
            { label: "Physics Lab", value: "Yes (Separate Room)" },
            { label: "Chemistry Lab", value: "Yes (Separate Room)" },
            { label: "Biology Lab", value: "Yes (Separate Room)" },
            { label: "Mathematics Lab", value: "Yes (Shared Room)" },
            { label: "Language Lab", value: "Yes (Separate Room)" },
            { label: "Geography Lab", value: "No" },
            { label: "Home Science Lab", value: "No" },
            { label: "Psychology Lab", value: "No" },
            { label: "Computer Science Lab", value: "Yes (Separate Room)" },
        ],
        equipment: [
            { label: "Audio Visual Equipment", value: "Available" },
            { label: "Biometric Attendance Device", value: "Available" },
            { label: "Science Kit", value: "Available" },
            { label: "Math Kit", value: "Available" },
        ],
        digital: [
            { label: "Desktop / PCs – Total", value: "45" },
            { label: "Desktop / PCs – For Teaching", value: "30" },
            { label: "Laptops / Notebooks – Total", value: "15" },
            { label: "Laptops / Notebooks – For Teaching", value: "10" },
            { label: "Tablets – Total", value: "30" },
            { label: "Tablets – For Teaching", value: "30" },
            { label: "PCs with Integrated Teaching Devices", value: "5 (3 for Teaching)" },
            { label: "Digital Boards / CMS / LMS", value: "8 (8 for Teaching)" },
            { label: "Projectors – Total", value: "10 (10 for Teaching)" },
            { label: "Printers", value: "4" },
            { label: "Scanners", value: "2" },
            { label: "Servers", value: "1" },
            { label: "Web Cameras", value: "5" },
            { label: "Smart TVs", value: "3 (3 for Teaching)" },
            { label: "Smart Classrooms", value: "8" },
            { label: "Mobile Phones Used for Teaching", value: "5" },
            { label: "Generator / Invertor / UPS (>1KVA)", value: "2" },
        ],
        ict: [
            { label: "ICT Lab Available?", value: "Yes" },
            { label: "Number of ICT Labs", value: "2" },
            { label: "Total Functional ICT Devices", value: "60" },
            { label: "Separate ICT Lab Room?", value: "Yes" },
            { label: "Samagra Shiksha ICT Lab?", value: "Yes" },
            { label: "Samagra ICT – Year of Establishment", value: "2019" },
            { label: "Samagra ICT – Functional?", value: "Yes" },
            { label: "Samagra ICT – Model", value: "Model-1 (10+1 Setup)" },
            { label: "Samagra ICT – Instructor Type", value: "Regular Trained Teacher" },
        ],
        internet: [
            { label: "Internet Available?", value: "Yes" },
            { label: "Internet Connection Type", value: "Fiber Optic (Broadband)" },
            { label: "Internet Used for Pedagogy?", value: "Yes" },
            { label: "ICT Based Tools Used for Teaching?", value: "Yes" },
            { label: "E-Content / Digital Resources Access?", value: "Yes" },
            { label: "Assistive Technology for CWSN?", value: "Yes" },
            { label: "Access to DTH / TV Channels?", value: "Yes" },
        ],
    },
    staff: {
        counts: [
            { label: "Regular Teaching Staff", value: "38" },
            { label: "Non-Regular / Contract Teaching Staff", value: "7" },
            { label: "Total Teaching Staff", value: "45" },
            { label: "Total Non-Teaching Staff", value: "12" },
            { label: "Total Vocational Resource Persons", value: "3" },
        ],
        required: [
            { label: "Staff Required – Pre-Primary", value: "3" },
            { label: "Staff Required – Primary", value: "12" },
            { label: "Staff Required – Upper Primary", value: "10" },
            { label: "Staff Required – Secondary", value: "10" },
            { label: "Staff Required – Higher Secondary", value: "8" },
        ],
        teachingSample: [
            { label: "Teacher 1 – Name", value: "Mrs. Sunita Sharma" },
            { label: "Teacher 1 – Gender", value: "Female" },
            { label: "Teacher 1 – DOB", value: "15-Mar-1980" },
            { label: "Teacher 1 – Social Category", value: "General" },
            { label: "Teacher 1 – Academic Level", value: "Post Graduate (M.Sc Physics)" },
            { label: "Teacher 1 – Professional Qualification", value: "B.Ed." },
            { label: "Teacher 1 – National Code", value: "TCH0987654" },
            { label: "Teacher 1 – Mobile", value: "+91 9012345678" },
            { label: "Teacher 1 – Type", value: "PGT – Post Graduate Teacher" },
            { label: "Teacher 1 – Appointed Level", value: "PGT" },
            { label: "Teacher 1 – Classes Taught", value: "11th & 12th" },
            { label: "Teacher 1 – Main Subject", value: "Physics" },
            { label: "Teacher 1 – Nature of Appointment", value: "Regular" },
            { label: "Teacher 1 – Date Joined Service", value: "01-Jul-2005" },
            { label: "Teacher 1 – Date Joined This School", value: "15-Aug-2012" },
            { label: "Teacher 1 – TET Qualified?", value: "Yes (2008)" },
            { label: "Teacher 1 – NISHTHA Trained?", value: "Yes" },
            { label: "Teacher 1 – Trained for CWSN?", value: "Yes" },
            { label: "Teacher 1 – Computer Trained?", value: "Yes" },
            { label: "Teacher 1 – Digital Teaching Capable?", value: "Yes" },
            { label: "Teacher 1 – Languages", value: "Hindi, English, Sanskrit" },
        ],
        nonTeachingSample: [
            { label: "Non-Teaching 1 – Name", value: "Mr. Ramesh Verma" },
            { label: "Non-Teaching 1 – Gender", value: "Male" },
            { label: "Non-Teaching 1 – DOB", value: "22-Jun-1975" },
            { label: "Non-Teaching 1 – Current Post", value: "Head Clerk" },
            { label: "Non-Teaching 1 – Academic Level", value: "Graduate (B.Com)" },
            { label: "Non-Teaching 1 – Nature of Appointment", value: "Regular" },
            { label: "Non-Teaching 1 – Date Joined Service", value: "10-Sep-2000" },
            { label: "Non-Teaching 1 – Date Joined School", value: "10-Sep-2000" },
            { label: "Non-Teaching 1 – Mobile", value: "+91 8901234567" },
        ],
        vocationalSample: [
            { label: "Vocational RP 1 – Name", value: "Ms. Priya Singh" },
            { label: "Vocational RP 1 – Gender", value: "Female" },
            { label: "Vocational RP 1 – DOB", value: "10-Nov-1990" },
            { label: "Vocational RP 1 – VTP Code", value: "VTP-UP-2022-567" },
            { label: "Vocational RP 1 – Sector", value: "IT-ITES" },
            { label: "Vocational RP 1 – Job Role", value: "Domestic Data Entry Operator" },
            { label: "Vocational RP 1 – Professional Qual.", value: "Diploma in IT" },
            { label: "Vocational RP 1 – Industry Experience", value: "3+ Years" },
            { label: "Vocational RP 1 – Received Induction?", value: "Yes" },
            { label: "Vocational RP 1 – Nature of Appointment", value: "Contractual" },
        ],
        qualifications: [
            { label: "100% Trained Teachers?", value: "Yes" },
            { label: "Average Teacher Attendance", value: "95%" },
        ],
    },
    safety: {
        compliance: [
            { label: "Disaster Management Plan Available?", value: "Yes" },
            { label: "Structural Safety Audit Done?", value: "Yes" },
            { label: "Non-Structural Safety Audit Done?", value: "Yes" },
            { label: "CCTV Cameras Installed?", value: "Yes (24 Cameras)" },
            { label: "Fire Extinguishers Installed?", value: "Yes (15 Units)" },
            { label: "Nodal Teacher for Safety?", value: "Yes" },
            { label: "Staff Trained on Safety/First Aid?", value: "Yes" },
            { label: "Safety Training Date", value: "10-Aug-2024" },
            { label: "Disaster Management Taught as Subject?", value: "Yes" },
            { label: "Mock Drill Conducted (Current Year)?", value: "Yes" },
        ],
        girlsSafety: [
            { label: "Self-Defence Training Grant Received?", value: "Yes" },
            { label: "Girls Trained – Upper Primary", value: "120" },
            { label: "Girls Trained – Secondary", value: "200" },
            { label: "Girls Trained – Higher Secondary", value: "180" },
        ],
        display: [
            { label: "Safety / No Tobacco Display Board?", value: "Yes" },
            { label: "First Level Counselor Available?", value: "Yes" },
            { label: "Safety Audit Frequency", value: "Annual" },
        ],
    },
    capacity: {
        sectionConfig: [
            { label: "Pre-Primary – Nursery", value: "1 Section (A)" },
            { label: "Pre-Primary – LKG", value: "1 Section (A)" },
            { label: "Pre-Primary – UKG", value: "2 Sections (A, B)" },
            { label: "Class 1", value: "3 Sections (A, B, C)" },
            { label: "Class 2", value: "3 Sections (A, B, C)" },
            { label: "Class 3", value: "3 Sections (A, B, C)" },
            { label: "Class 4", value: "3 Sections (A, B, C)" },
            { label: "Class 5", value: "3 Sections (A, B, C)" },
            { label: "Class 6", value: "2 Sections (A, B)" },
            { label: "Class 7", value: "2 Sections (A, B)" },
            { label: "Class 8", value: "2 Sections (A, B)" },
            { label: "Class 9", value: "2 Sections (A, B)" },
            { label: "Class 10", value: "2 Sections (A, B)" },
            { label: "Class 11", value: "2 Sections (A, B)" },
            { label: "Class 12", value: "2 Sections (A, B)" },
        ],
        enrollment: [
            { label: "Total Enrollment", value: "1,250" },
            { label: "Boys Enrollment", value: "650" },
            { label: "Girls Enrollment", value: "600" },
            { label: "CWSN Students", value: "15" },
            { label: "RTE Beneficiaries", value: "120" },
        ],
        metrics: [
            { label: "Average Student Attendance", value: "92%" },
            { label: "Dropout Rate", value: "2.1%" },
        ],
        studentSample: [
            { label: "Student 1 – Name", value: "AARAV KUMAR" },
            { label: "Student 1 – Gender", value: "Male" },
            { label: "Student 1 – DOB", value: "15-May-2012" },
            { label: "Student 1 – Mother's Name", value: "MEENA DEVI" },
            { label: "Student 1 – Father's Name", value: "SURESH KUMAR" },
            { label: "Student 1 – Address", value: "45, Sector 12, Gomti Nagar, Lucknow" },
            { label: "Student 1 – Mobile", value: "+91 9087654321" },
            { label: "Student 1 – Mother Tongue", value: "Hindi" },
            { label: "Student 1 – Social Category", value: "OBC" },
            { label: "Student 1 – Minority Group", value: "Not Applicable" },
            { label: "Student 1 – BPL?", value: "No" },
            { label: "Student 1 – EWS?", value: "No" },
            { label: "Student 1 – CWSN?", value: "No" },
            { label: "Student 1 – Blood Group", value: "B+" },
            { label: "Student 1 – Grade & Section", value: "Class 7 – Section A" },
            { label: "Student 1 – Roll Number", value: "12" },
            { label: "Student 1 – Admission Date", value: "01-Apr-2018" },
            { label: "Student 1 – Medium of Instruction", value: "Hindi" },
            { label: "Student 1 – Previous Year Status", value: "Studied at Same School" },
            { label: "Student 1 – Admitted Under RTE?", value: "No" },
            { label: "Student 1 – Previous Class Result", value: "Promoted / Passed" },
            { label: "Student 1 – Previous Year Attendance", value: "94%" },
            { label: "Student 1 – Free Textbooks Received?", value: "Yes" },
            { label: "Student 1 – Free Uniform Received?", value: "Yes" },
            { label: "Student 1 – Height (cm)", value: "142" },
            { label: "Student 1 – Weight (kg)", value: "35" },
            { label: "Student 1 – Distance from School", value: "Between 1-3 Kms" },
            { label: "Student 1 – Guardian's Education", value: "Higher Secondary" },
        ],
    },
    vocational: {
        details: [
            { label: "Vocational Courses Offered?", value: "Yes" },
            { label: "Funding Source", value: "Samagra Shiksha" },
            { label: "Sanction Order Number", value: "SS/UP/VOC/2023/1234" },
            { label: "Pre-Vocational Education (Grades 6-8)?", value: "Yes" },
            { label: "Skill Knowledge Provider Centre?", value: "No" },
        ],
        sectors: [
            { label: "Grade 9 – Sector", value: "IT-ITES" },
            { label: "Grade 9 – Job Role", value: "Domestic Data Entry Operator" },
            { label: "Grade 9 – Year Started", value: "2020" },
            { label: "Grade 10 – Sector", value: "IT-ITES" },
            { label: "Grade 10 – Job Role", value: "Domestic Data Entry Operator" },
            { label: "Grade 10 – Year Started", value: "2020" },
            { label: "Grade 11 – Sector", value: "Healthcare" },
            { label: "Grade 11 – Job Role", value: "General Duty Assistant" },
            { label: "Grade 11 – Year Started", value: "2021" },
            { label: "Grade 12 – Sector", value: "Retail" },
            { label: "Grade 12 – Job Role", value: "Store Operations Assistant" },
            { label: "Grade 12 – Year Started", value: "2022" },
        ],
        engagement: [
            { label: "Guest Lecturers from Industry (Annual)", value: "12" },
            { label: "Industry / Field Visits (Annual)", value: "8" },
            { label: "Active Industry Linkages / MoUs", value: "4" },
        ],
        placement10: [
            { label: "Grade 10 – Students Enrolled in Vocational", value: "60" },
            { label: "Grade 10 – Students Passed", value: "58" },
            { label: "Grade 10 – Self Employed", value: "3" },
            { label: "Grade 10 – Placed / Employed", value: "5" },
        ],
        placement12: [
            { label: "Grade 12 – Students Enrolled in Vocational", value: "45" },
            { label: "Grade 12 – Students Passed", value: "42" },
            { label: "Grade 12 – Self Employed", value: "8" },
            { label: "Grade 12 – Placed / Employed", value: "15" },
        ],
        labs: [
            { label: "Vocational Lab Sector 1 (IT-ITES)", value: "Good Condition, Separate Room" },
            { label: "Vocational Lab Sector 2 (Healthcare)", value: "Good Condition, Separate Room" },
            { label: "Vocational Lab Sector 3 (Retail)", value: "Good Condition, Shared Room" },
        ],
    },
    transport: {
        compliance: [
            { label: "Fitness Certificate available for all school vehicles? (M)", value: "Yes" },
            { label: "Vehicle Age under 15 years? (M)", value: "Yes" },
            { label: "Vehicle Permit valid as per Motor Vehicle Act? (M)", value: "Yes" },
            { label: "Speed Governor installed (Max 40 kmph)? (M)", value: "Yes" },
            { label: "Vehicle Exterior – White body with green stripe? (M)", value: "Yes" },
            { label: "'SCHOOL BUS' prominently written front and back? (M)", value: "Yes" },
            { label: "Hired bus exclusively on school duty? (M)", value: "Yes" },
            { label: "School name and number written on hired bus? (M)", value: "Yes" },
            { label: "Drivers possess 5 yrs Heavy or 4 yrs LMV exp? (M)", value: "Yes" },
            { label: "Drivers have clean traffic offence records? (M)", value: "Yes" },
            { label: "Autorickshaws safety guidelines enforced? (M)", value: "Yes" },
            { label: "Parents instructed for auto-rickshaw safety? (M)", value: "Yes" },
            { label: "Autorickshaws registered with school? (M)", value: "Yes" },
        ],
    },
};

const SECTIONS = [
    { id: "basic", label: "Basic Details", icon: Building2 },
    { id: "receipts", label: "Receipts & Expenditure", icon: Receipt },
    { id: "legal", label: "Legal Details", icon: Scale },
    { id: "location", label: "Location", icon: MapPin },
    { id: "infra", label: "Infrastructure", icon: Wrench },
    { id: "staff", label: "Staff", icon: Users },
    { id: "safety", label: "Safety", icon: ShieldAlert },
    { id: "capacity", label: "Student Capacity", icon: GraduationCap },
    { id: "vocational", label: "Vocational Education", icon: BookOpen },
    { id: "transport", label: "Transportation Details", icon: Bus },
];

function DataGrid({ title, items }: { title?: string, items: { label: string, value: string }[] }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
            {title && <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 font-bold text-slate-800 text-sm tracking-tight">{title}</div>}
            <div className="divide-y divide-slate-100">
                {items.map((item, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-start justify-between px-6 py-4 hover:bg-slate-50/40 transition-colors gap-4">
                        <span className="text-sm font-medium text-slate-500 sm:w-1/2 mt-0.5">{item.label}</span>
                        <div className="text-sm font-semibold text-slate-800 sm:w-1/2 sm:text-right flex items-center sm:justify-end gap-2">
                           {item.value === "Yes" ? <span className="text-emerald-600 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Yes</span> : item.value}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function DataRenderer({ sectionId }: { sectionId: string }) {
    switch (sectionId) {
        case "basic": return (
            <>
                <DataGrid title="School Identity" items={mockData.basic.identity} />
                <DataGrid title="School Contact Details" items={mockData.basic.contact} />
                <DataGrid title="Management & Classification" items={mockData.basic.management} />
                <DataGrid title="Class Range" items={mockData.basic.classRange} />
                <DataGrid title="Curriculum Details" items={mockData.basic.curriculum} />
                <DataGrid title="School Profile" items={mockData.basic.schoolProfile} />
                <DataGrid title="Distance to Nearest Schools" items={mockData.basic.distances} />
                <DataGrid title="Operational Details" items={mockData.basic.operational} />
                <DataGrid title="Anganwadi / Balavatika" items={mockData.basic.anganwadi} />
                <DataGrid title="Special Programs" items={mockData.basic.specialPrograms} />
                <DataGrid title="Academic Inspections & Visits" items={mockData.basic.inspections} />
                <DataGrid title="School Governance" items={mockData.basic.governance} />
                <DataGrid title="Financial Registration" items={mockData.basic.financial} />
                <DataGrid title="Multi-Class Teaching" items={mockData.basic.multiClass} />
                <DataGrid title="School Complex Details" items={mockData.basic.schoolComplex} />
                <DataGrid title="Government Initiatives" items={mockData.basic.initiatives} />
                <DataGrid title="PM POSHAN (Mid-Day Meal)" items={mockData.basic.pmPoshan} />
                <DataGrid title="Attendance Capture" items={mockData.basic.attendance} />
                <DataGrid title="Clubs & Certifications" items={mockData.basic.clubs} />
            </>
        );
        case "receipts": return (
            <>
                <DataGrid title="Grants – Receipt & Expenditure" items={mockData.receipts.grants} />
                <DataGrid title="Non-Government Financial Assistance" items={mockData.receipts.assistance} />
                <DataGrid title="Asset / Stock Registers" items={mockData.receipts.assets} />
                <DataGrid title="Annual Expenditure Summary" items={mockData.receipts.expenditure} />
            </>
        );
        case "legal": return (
            <>
                <DataGrid title="Registration & Ownership" items={mockData.legal.details} />
                <DataGrid title="Land & Playground Configuration" items={mockData.legal.land} />
            </>
        );
        case "location": return (
            <>
                <DataGrid title="Full Address Details" items={mockData.location.address} />
                <DataGrid title="Geographical Mapping & Connectivity" items={mockData.location.geo} />
            </>
        );
        case "infra": return (
            <>
                <DataGrid title="Building Overview" items={mockData.infra.buildings} />
                <DataGrid title="Storey Details" items={mockData.infra.storeys} />
                <DataGrid title="Classroom Details" items={mockData.infra.classrooms} />
                <DataGrid title="Building Condition Summary" items={mockData.infra.buildingCondition} />
                <DataGrid title="Electricity & Climate Control" items={mockData.infra.electricity} />
                <DataGrid title="Rooms & Labs" items={mockData.infra.rooms} />
                <DataGrid title="Sanitation – Toilets" items={mockData.infra.sanitation} />
                <DataGrid title="Hygiene Facilities" items={mockData.infra.hygiene} />
                <DataGrid title="Drinking Water" items={mockData.infra.water} />
                <DataGrid title="Library & Reading" items={mockData.infra.library} />
                <DataGrid title="Health & Medical Facilities" items={mockData.infra.health} />
                <DataGrid title="Accessibility (CWSN / Divyang)" items={mockData.infra.accessibility} />
                <DataGrid title="Other Facilities" items={mockData.infra.facilities} />
                <DataGrid title="Advanced Facilities" items={mockData.infra.advanced} />
                <DataGrid title="Hostel Facilities" items={mockData.infra.hostel} />
                <DataGrid title="Higher Secondary Subject Labs" items={mockData.infra.labs} />
                <DataGrid title="Equipment Availability" items={mockData.infra.equipment} />
                <DataGrid title="Digital Equipment Inventory" items={mockData.infra.digital} />
                <DataGrid title="ICT Lab Details" items={mockData.infra.ict} />
                <DataGrid title="Internet & Digital Learning" items={mockData.infra.internet} />
            </>
        );
        case "staff": return (
            <>
                <DataGrid title="Staff Strength" items={mockData.staff.counts} />
                <DataGrid title="Staff Requirement (as per RTE Norms)" items={mockData.staff.required} />
                <DataGrid title="Teaching Staff – Sample Profile" items={mockData.staff.teachingSample} />
                <DataGrid title="Non-Teaching Staff – Sample Profile" items={mockData.staff.nonTeachingSample} />
                <DataGrid title="Vocational Resource Persons – Sample" items={mockData.staff.vocationalSample} />
                <DataGrid title="Performance Metrics" items={mockData.staff.qualifications} />
            </>
        );
        case "safety": return (
            <>
                <DataGrid title="Safety Regulations & Compliance" items={mockData.safety.compliance} />
                <DataGrid title="Girls' Self-Defence Training" items={mockData.safety.girlsSafety} />
                <DataGrid title="Safety Display & Counseling" items={mockData.safety.display} />
            </>
        );
        case "capacity": return (
            <>
                <DataGrid title="Section Configuration" items={mockData.capacity.sectionConfig} />
                <DataGrid title="Current Enrollment Status" items={mockData.capacity.enrollment} />
                <DataGrid title="Student Metrics" items={mockData.capacity.metrics} />
                <DataGrid title="Student Profile – Sample Record" items={mockData.capacity.studentSample} />
            </>
        );
        case "vocational": return (
            <>
                <DataGrid title="Vocational Program Overview" items={mockData.vocational.details} />
                <DataGrid title="Sector-Wise Course Mapping" items={mockData.vocational.sectors} />
                <DataGrid title="Industry Engagement" items={mockData.vocational.engagement} />
                <DataGrid title="Placement – Grade 10" items={mockData.vocational.placement10} />
                <DataGrid title="Placement – Grade 12" items={mockData.vocational.placement12} />
                <DataGrid title="Vocational Lab Infrastructure" items={mockData.vocational.labs} />
            </>
        );
        case "transport": return <DataGrid title="Transportation Regulations Compliance" items={mockData.transport.compliance} />;
        default: return <div>Select a section</div>;
    }
}

export default function ProfileBookletModal({ isOpen, onClose, schoolName, udiseCode, mode = "view" }: ProfileBookletModalProps) {
    const [activeSection, setActiveSection] = useState(SECTIONS[0].id);

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-[90vw] md:w-[80vw] lg:w-[1000px] h-full bg-slate-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              
              {/* Header */}
              <div className="flex items-center justify-between p-6 bg-white border-b border-slate-200 shrink-0">
                  <div>
                      <h2 className="text-xl font-bold text-slate-800">{schoolName || mockData.basic.identity[0].value}</h2>
                      <p className="text-sm text-slate-500 font-medium mt-1">
                          UDISE: <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">{udiseCode || mockData.basic.identity[1].value}</span>
                          <span className="mx-2">•</span>
                          {mode === "verify" ? "Verification Mode" : "Profile Booklet View"}
                      </p>
                  </div>
                  <button 
                      onClick={onClose}
                      className="p-2.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors bg-white border border-slate-200"
                  >
                      <X className="w-5 h-5" />
                  </button>
              </div>

              {/* Layout */}
              <div className="flex flex-1 overflow-hidden">
                  
                  {/* Sidebar Navigation */}
                  <div className="w-64 bg-white border-r border-slate-200 overflow-y-auto shrink-0 p-4 space-y-1 hidden md:block">
                      {SECTIONS.map((section) => {
                          const isActive = activeSection === section.id;
                          const Icon = section.icon;
                          return (
                              <button
                                  key={section.id}
                                  onClick={() => setActiveSection(section.id)}
                                  className={cn(
                                      "w-full flex justify-start items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                                      isActive 
                                          ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50" 
                                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                                  )}
                              >
                                  <Icon className={cn("w-4 h-4", isActive ? "text-blue-600" : "text-slate-400")} />
                                  <span className="text-left">{section.label}</span>
                              </button>
                          );
                      })}
                  </div>

                  {/* Main Content Area */}
                  <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50 relative">
                     <div className="flex-1 overflow-y-auto p-6 md:p-8">
                         {/* Mobile Dropdown for Navigation (Optional graceful fallback) */}
                         <div className="md:hidden mb-6">
                            <select 
                               className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                               value={activeSection}
                               onChange={e => setActiveSection(e.target.value)}
                            >
                               {SECTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                            </select>
                         </div>

                         <div className="max-w-3xl mx-auto pb-6">
                            <DataRenderer sectionId={activeSection} />
                         </div>
                     </div>

                     {/* Verification Footer */}
                     {mode === "verify" && (
                         <div className="border-t border-slate-200 bg-white p-6 shrink-0 z-10 w-full flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Verification Remarks</label>
                                <textarea className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50" rows={3} placeholder="Add your constructive remarks or reasons for rejection here..."></textarea>
                            </div>
                            <div className="flex flex-wrap items-center justify-end gap-3">
                                <button className="px-5 py-2.5 rounded-xl border border-rose-200 text-rose-600 font-semibold hover:bg-rose-50 transition-colors text-sm" onClick={() => { alert("Application Rejected"); onClose(); }}>Reject Application</button>
                                <button className="px-5 py-2.5 rounded-xl border border-amber-200 text-amber-600 font-semibold hover:bg-amber-50 transition-colors text-sm" onClick={() => { alert("Changes Requested"); onClose(); }}>Request Changes</button>
                                <button className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors shadow-sm text-sm flex items-center gap-2" onClick={() => { alert("Profile Verified!"); onClose(); }}>
                                    <CheckCircle2 className="w-4 h-4" /> Approve Profile
                                </button>
                            </div>
                         </div>
                     )}
                  </div>

              </div>
          </div>
      </div>
    );
}
