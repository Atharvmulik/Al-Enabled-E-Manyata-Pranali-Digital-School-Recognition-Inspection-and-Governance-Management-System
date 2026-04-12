"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
    X, Maximize2, Building2, MapPin, Users, Shield,
    BookOpen, Truck, Wrench, GraduationCap, ChevronRight,
    CheckCircle2, XCircle, AlertCircle, Loader2, FileText,
    Phone, Mail, Globe, Calendar, Hash, Award, Layers,
    Baby, ClipboardList, Cpu, FlaskConical, Bus
} from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileBookletModalProps {
    isOpen:     boolean;
    onClose:    () => void;
    schoolName: string;
    udiseCode:  string;
    schoolId:   string;
    mode?:      "view" | "verify";
}

type NavSection = {
    id:    string;
    label: string;
    icon:  React.ElementType;
};

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV_SECTIONS: NavSection[] = [
    { id: "basic_details",        label: "Basic Details",         icon: Building2      },
    { id: "receipts_expenditure", label: "Receipts & Expenditure",icon: FileText       },
    { id: "legal_details",        label: "Legal Details",         icon: ClipboardList  },
    { id: "location",             label: "Location",              icon: MapPin         },
    { id: "infrastructure",       label: "Infrastructure",        icon: Wrench         },
    { id: "staff",                label: "Staff",                 icon: Users          },
    { id: "safety",               label: "Safety",                icon: Shield         },
    { id: "student_capacity",     label: "Student Capacity",      icon: GraduationCap  },
    { id: "vocational_education", label: "Vocational Education",  icon: FlaskConical   },
    { id: "transport",            label: "Transportation",        icon: Bus            },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const val = (v: any): string => {
    if (v === null || v === undefined || v === "" || v === "None") return "—";
    return String(v);
};

const yesNo = (v: any) => {
    if (!v) return <span className="text-slate-400">—</span>;
    const s = String(v).toLowerCase();
    if (s.startsWith("1") || s === "yes" || s === "true")
        return <span className="flex items-center gap-1 text-emerald-600 font-semibold"><CheckCircle2 className="w-3.5 h-3.5" /> Yes</span>;
    if (s.startsWith("2") || s === "no" || s === "false")
        return <span className="flex items-center gap-1 text-rose-500 font-semibold"><XCircle className="w-3.5 h-3.5" /> No</span>;
    return <span className="text-slate-600">{v}</span>;
};

const Badge = ({ text, color = "blue" }: { text: string; color?: string }) => {
    const colors: Record<string, string> = {
        blue:   "bg-blue-50 text-blue-700 border-blue-100",
        green:  "bg-emerald-50 text-emerald-700 border-emerald-100",
        amber:  "bg-amber-50 text-amber-700 border-amber-100",
        red:    "bg-rose-50 text-rose-700 border-rose-100",
        purple: "bg-purple-50 text-purple-700 border-purple-100",
        slate:  "bg-slate-100 text-slate-600 border-slate-200",
    };
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${colors[color] ?? colors.blue}`}>
            {text}
        </span>
    );
};

const SectionTitle = ({ title }: { title: string }) => (
    <h3 className="text-base font-bold text-slate-800 mt-6 mb-3 pb-2 border-b border-slate-100 first:mt-0">
        {title}
    </h3>
);

const InfoGrid = ({ rows }: { rows: [string, any][] }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
        {rows.map(([label, value], i) => (
            <div key={i} className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                <span className="text-sm text-slate-800 font-medium">{value ?? "—"}</span>
            </div>
        ))}
    </div>
);

const EmptyState = ({ message = "No data available for this section." }: { message?: string }) => (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <AlertCircle className="w-10 h-10 mb-3 opacity-30" />
        <p className="text-sm">{message}</p>
    </div>
);

// ─── Section renderers ────────────────────────────────────────────────────────

function BasicDetailsSection({ data }: { data: any }) {
    const bd = data?.basic_details || {};
    if (!bd || Object.keys(bd).length === 0) return <EmptyState />;

    return (
        <div className="space-y-6">
            <SectionTitle title="School Identity" />
            <InfoGrid rows={[
                ["School Name",       val(bd.school_name)],
                ["UDISE Number",      val(bd.udise_number)],
                ["Establishment Year",val(bd.est_year)],
                ["Board Affiliation", val(bd.board_affiliation)],
                ["School Type",       val(bd.school_type)],
                ["School Category",   val(bd.school_category)],
                ["Classification",    val(bd.classification)],
                ["Application Type",  val(bd.application_type)],
                ["Lowest Class",      val(bd.lowest_class)],
                ["Highest Class",     val(bd.highest_class)],
                ["Location Type",     val(bd.location_type)],
                ["Is PM-SHRI",        yesNo(bd.is_pm_shri)],
            ]} />

            <SectionTitle title="Management" />
            <InfoGrid rows={[
                ["Management Group",  val(bd.management_group)],
                ["Management Code",   val(bd.management_code)],
                ["Sub-Management",    val(bd.sub_management)],
                ["Is Minority",       yesNo(bd.is_minority)],
                ["Minority Community",val(bd.minority_community)],
                ["Is Residential",    yesNo(bd.is_residential)],
                ["Residential Type",  val(bd.residential_type)],
                ["Is Shift School",   yesNo(bd.is_shift)],
            ]} />

            <SectionTitle title="Contact Details" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {bd.mobile && (
                    <a href={`tel:${bd.mobile}`} className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                        <Phone className="w-4 h-4" />{bd.mobile}
                    </a>
                )}
                {bd.email && (
                    <a href={`mailto:${bd.email}`} className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                        <Mail className="w-4 h-4" />{bd.email}
                    </a>
                )}
                {bd.website && (
                    <a href={bd.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                        <Globe className="w-4 h-4" />{bd.website}
                    </a>
                )}
                {bd.landline && (
                    <span className="flex items-center gap-2 text-sm text-slate-700">
                        <Phone className="w-4 h-4 text-slate-400" />{bd.std_code ? `(${bd.std_code}) ` : ""}{bd.landline}
                    </span>
                )}
            </div>

            <SectionTitle title="Academic Details" />
            <InfoGrid rows={[
                ["Curriculum (Primary)",       val(bd.curriculum_primary)],
                ["Curriculum (Upper Primary)", val(bd.curriculum_upper_primary)],
                ["Is RTE School",              yesNo(bd.is_rte)],
                ["Is Vocational",              yesNo(bd.is_vocational)],
                ["Is Pre-Vocational",          yesNo(bd.is_pre_vocational)],
                ["Instructional Days",         val(bd.instructional_days)],
                ["Is CCE",                     yesNo(bd.is_cce)],
                ["Mother Tongue Medium",       yesNo(bd.is_mother_tongue)],
                ["Has SMC",                    yesNo(bd.has_smc)],
                ["Has PTA",                    yesNo(bd.has_pta)],
                ["PTA Meetings",               val(bd.pta_meetings)],
                ["Has PFMS",                   yesNo(bd.has_pfms)],
            ]} />

            {Array.isArray(data.anganwadi_rows) && data.anganwadi_rows.length > 0 && (
                <>
                    <SectionTitle title="Anganwadi Centres" />
                    <div className="overflow-x-auto rounded-xl border border-slate-100">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-2 text-left">Code</th>
                                    <th className="px-4 py-2 text-left">Name</th>
                                    <th className="px-4 py-2 text-center">Boys</th>
                                    <th className="px-4 py-2 text-center">Girls</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.anganwadi_rows.map((r: any, i: number) => (
                                    <tr key={i} className="border-t border-slate-100">
                                        <td className="px-4 py-2">{val(r.code)}</td>
                                        <td className="px-4 py-2">{val(r.name)}</td>
                                        <td className="px-4 py-2 text-center">{val(r.boys)}</td>
                                        <td className="px-4 py-2 text-center">{val(r.girls)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

function ReceiptsSection({ data }: { data: any }) {
    const re = data?.receipts_expenditure || {};
    const grants = data?.grants || [];
    const assistance = data?.assistance || [];

    const hasData = Object.keys(re).length > 0 || grants.length > 0 || assistance.length > 0;
    if (!hasData) return <EmptyState />;

    return (
        <div className="space-y-6">
            <SectionTitle title="Annual Expenditure" />
            <InfoGrid rows={[
                ["Maintenance / Housekeeping", val(re.exp_maintenance)],
                ["Teachers",                   val(re.exp_teachers)],
                ["Construction Works",         val(re.exp_construction)],
                ["Others",                     val(re.exp_others)],
            ]} />

            {grants.length > 0 && (
                <>
                    <SectionTitle title="Grants Received" />
                    <div className="overflow-x-auto rounded-xl border border-slate-100">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-2 text-left">Grant Name</th>
                                    <th className="px-4 py-2 text-right">Receipt (₹)</th>
                                    <th className="px-4 py-2 text-right">Expenditure (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {grants.map((g: any, i: number) => (
                                    <tr key={i} className="border-t border-slate-100">
                                        <td className="px-4 py-2">{val(g.grant_name || g.grantName)}</td>
                                        <td className="px-4 py-2 text-right">{val(g.receipt)}</td>
                                        <td className="px-4 py-2 text-right">{val(g.expenditure)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {assistance.length > 0 && (
                <>
                    <SectionTitle title="Financial Assistance" />
                    <div className="overflow-x-auto rounded-xl border border-slate-100">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-2 text-left">Source</th>
                                    <th className="px-4 py-2 text-center">Received?</th>
                                    <th className="px-4 py-2 text-left">Name</th>
                                    <th className="px-4 py-2 text-right">Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assistance.map((a: any, i: number) => (
                                    <tr key={i} className="border-t border-slate-100">
                                        <td className="px-4 py-2 text-xs">{val(a.source)}</td>
                                        <td className="px-4 py-2 text-center">{yesNo(a.is_received || a.isReceived)}</td>
                                        <td className="px-4 py-2">{val(a.name)}</td>
                                        <td className="px-4 py-2 text-right">{val(a.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

function LegalDetailsSection({ data }: { data: any }) {
    const ld = data?.legal_details || {};
    const vocRows = data?.vocational_rows || [];
    if (Object.keys(ld).length === 0 && vocRows.length === 0) return <EmptyState />;

    return (
        <div className="space-y-6">
            <SectionTitle title="Legal & Recognition" />
            <InfoGrid rows={[
                ["Recognition Number", val(ld.recognition_number)],
                ["Recognition Date",   val(ld.recognition_date)],
                ["Affiliation Number", val(ld.affiliation_number)],
                ["Funding Source",     val(ld.funding_source)],
                ["Sanction Order No.", val(ld.sanction_order_number)],
                ["Is Vocational",      yesNo(ld.is_vocational)],
            ]} />

            {vocRows.length > 0 && (
                <>
                    <SectionTitle title="Vocational Sectors / Job Roles" />
                    <div className="overflow-x-auto rounded-xl border border-slate-100">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-2 text-left">Grade</th>
                                    <th className="px-4 py-2 text-left">Sector</th>
                                    <th className="px-4 py-2 text-left">Job Role</th>
                                    <th className="px-4 py-2 text-center">Year Starting</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vocRows.map((r: any, i: number) => (
                                    <tr key={i} className="border-t border-slate-100">
                                        <td className="px-4 py-2">{val(r.grade)}</td>
                                        <td className="px-4 py-2">{val(r.sector)}</td>
                                        <td className="px-4 py-2">{val(r.job_role || r.jobRole)}</td>
                                        <td className="px-4 py-2 text-center">{val(r.year_starting || r.yearStarting)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

function LocationSection({ data }: { data: any }) {
    const loc = data?.location || {};
    if (Object.keys(loc).length === 0) return <EmptyState />;

    return (
        <div className="space-y-6">
            <SectionTitle title="Address & Jurisdiction" />
            <InfoGrid rows={[
                ["Full Address",             val(loc.address)],
                ["District",                val(loc.district)],
                ["Taluka",                  val(loc.taluka)],
                ["Pin Code",                val(loc.pin_code)],
                ["Revenue Block",           val(loc.revenue_block)],
                ["Village Name",            val(loc.village_name)],
                ["Gram Panchayat",          val(loc.gram_panchayat)],
                ["Urban Local Body",        val(loc.urban_local_body)],
                ["Ward Name",               val(loc.ward_name)],
                ["CRC Name",                val(loc.crc_name)],
                ["Assembly Constituency",   val(loc.assembly_constituency)],
                ["Parliamentary Const.",    val(loc.parliamentary_constituency)],
            ]} />
        </div>
    );
}

function InfrastructureSection({ data }: { data: any }) {
    const inf = data?.infrastructure || {};
    if (Object.keys(inf).length === 0) return <EmptyState />;

    return (
        <div className="space-y-6">
            <SectionTitle title="Building" />
            <InfoGrid rows={[
                ["Building Status",         val(inf.building_status)],
                ["Boundary Wall",           val(inf.boundary_wall)],
                ["Active Building Blocks",  val(inf.active_building_blocks)],
                ["Pucca Blocks",            val(inf.building_pucca)],
                ["Kuchcha Blocks",          val(inf.building_kuchcha)],
                ["Dilapidated Blocks",      val(inf.building_dilapidated)],
                ["Under Construction",      val(inf.building_under_construction)],
                ["Has Electricity",         yesNo(inf.has_electricity)],
                ["Has Solar Panel",         yesNo(inf.has_solar_panel)],
            ]} />

            <SectionTitle title="Classrooms" />
            <InfoGrid rows={[
                ["Pre-Primary Classrooms",    val(inf.classrooms_pre_primary)],
                ["Primary Classrooms",        val(inf.classrooms_primary)],
                ["Upper Primary Classrooms",  val(inf.classrooms_upper_primary)],
                ["Secondary Classrooms",      val(inf.classrooms_secondary)],
                ["Higher Secondary Rooms",    val(inf.classrooms_higher_secondary)],
                ["Total Instructional Rooms", val(inf.total_instructional_rooms)],
                ["Not In Use",                val(inf.classrooms_not_in_use)],
                ["Dilapidated",               val(inf.classrooms_dilapidated)],
            ]} />

            <SectionTitle title="Facilities" />
            <InfoGrid rows={[
                ["Has Library",             yesNo(inf.has_library)],
                ["Library Books",           val(inf.library_books)],
                ["Has Playground",          yesNo(inf.has_playground)],
                ["Playground Area",         val(inf.playground_area)],
                ["Has Ramp (CWSN)",         yesNo(inf.has_ramp)],
                ["Has Hand Rails",          yesNo(inf.has_hand_rails)],
                ["Has ICT Lab",             yesNo(inf.has_ict_lab)],
                ["ICT Labs Count",          val(inf.ict_labs_count)],
                ["Has Internet",            yesNo(inf.has_internet)],
                ["Internet Type",           val(inf.internet_type)],
                ["Has Principal Room",      yesNo(inf.has_principal_room)],
                ["Has Staffroom",           yesNo(inf.has_staffroom)],
                ["Has Girls Common Room",   yesNo(inf.has_girls_common_room)],
                ["Has Kitchen Garden",      yesNo(inf.has_kitchen_garden)],
                ["Has First Aid",           yesNo(inf.has_first_aid)],
                ["Has Water Purifier",      yesNo(inf.has_water_purifier)],
            ]} />

            <SectionTitle title="Toilets" />
            <InfoGrid rows={[
                ["Boys Toilets (Total)",    val(inf.toilet_boys_total)],
                ["Boys Toilets (Func.)",    val(inf.toilet_boys_func)],
                ["Girls Toilets (Total)",   val(inf.toilet_girls_total)],
                ["Girls Toilets (Func.)",   val(inf.toilet_girls_func)],
                ["CWSN Boys Toilets",       val(inf.cwsn_boys_total)],
                ["CWSN Girls Toilets",      val(inf.cwsn_girls_total)],
                ["Has Incinerator",         yesNo(inf.has_incinerator)],
                ["Has Pad Vending Machine", yesNo(inf.has_pad_vending_machine)],
            ]} />

            {Array.isArray(data.higher_secondary_labs) && data.higher_secondary_labs.length > 0 && (
                <>
                    <SectionTitle title="Higher Secondary Labs" />
                    <div className="overflow-x-auto rounded-xl border border-slate-100">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-2 text-left">Lab</th>
                                    <th className="px-4 py-2 text-left">Availability</th>
                                    <th className="px-4 py-2 text-center">Separate Room</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.higher_secondary_labs.map((lab: any, i: number) => (
                                    <tr key={i} className="border-t border-slate-100">
                                        <td className="px-4 py-2 font-medium">{val(lab.name)}</td>
                                        <td className="px-4 py-2">{val(lab.availability)}</td>
                                        <td className="px-4 py-2 text-center">{yesNo(lab.separate_room || lab.separateRoom)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

function StaffSection({ data }: { data: any }) {
    const summary = data?.staff_summary || {};
    const teachers = data?.teachers || [];
    const nonTeaching = data?.non_teaching_staff || [];
    const vocStaff = data?.vocational_staff || [];

    const hasData = Object.keys(summary).length > 0 || teachers.length > 0;
    if (!hasData) return <EmptyState />;

    return (
        <div className="space-y-6">
            <SectionTitle title="Staff Summary" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: "Regular Teaching",  count: summary.count_regular },
                    { label: "Non-Regular",        count: summary.count_non_regular },
                    { label: "Non-Teaching",       count: summary.count_non_teaching },
                    { label: "Vocational",         count: summary.count_vocational },
                ].map((s, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-center">
                        <p className="text-2xl font-black text-slate-800">{val(s.count)}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {teachers.length > 0 && (
                <>
                    <SectionTitle title={`Teaching Staff (${teachers.length})`} />
                    <div className="space-y-3">
                        {teachers.map((t: any, i: number) => (
                            <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <div className="flex items-start justify-between gap-3 flex-wrap">
                                    <div>
                                        <p className="font-bold text-slate-800">{val(t.name)}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{val(t.teacher_type || t.teacherType)} · {val(t.appointed_level || t.appointedLevel)}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(t.professional_qual || t.professionalQual) && (
                                            <Badge text={String(t.professional_qual || t.professionalQual).split("-")[1] || "Qualified"} color="green" />
                                        )}
                                        {(t.is_tet_qualified || t.isTETQualified) === "1-Yes" && (
                                            <Badge text="TET ✓" color="blue" />
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 text-xs text-slate-600">
                                    <span><span className="font-semibold">Subject:</span> {val(t.appointed_for_subject || t.appointedForSubject)}</span>
                                    <span><span className="font-semibold">Gender:</span> {val(t.gender)}</span>
                                    <span><span className="font-semibold">Category:</span> {val(t.social_category || t.socialCategory)}</span>
                                    <span><span className="font-semibold">DOJ Service:</span> {val(t.date_joining_service || t.dateJoiningService)}</span>
                                    <span><span className="font-semibold">Mobile:</span> {val(t.mobile)}</span>
                                    <span><span className="font-semibold">Digital:</span> {val(t.is_capable_digital || t.isCapableDigital)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {nonTeaching.length > 0 && (
                <>
                    <SectionTitle title={`Non-Teaching Staff (${nonTeaching.length})`} />
                    <div className="space-y-3">
                        {nonTeaching.map((s: any, i: number) => (
                            <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between gap-3">
                                <div>
                                    <p className="font-bold text-slate-800">{val(s.name)}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{val(s.current_post || s.currentPost)} · {val(s.gender)}</p>
                                </div>
                                <Badge text={val(s.nature_of_appointment || s.natureOfAppointment)} color="slate" />
                            </div>
                        ))}
                    </div>
                </>
            )}

            {vocStaff.length > 0 && (
                <>
                    <SectionTitle title={`Vocational Resource Persons (${vocStaff.length})`} />
                    <div className="space-y-3">
                        {vocStaff.map((v: any, i: number) => (
                            <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <p className="font-bold text-slate-800">{val(v.name)}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{val(v.sector)} · {val(v.job_role || v.jobRole)}</p>
                                <p className="text-xs text-slate-500 mt-0.5">Experience: {val(v.experience)}</p>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function SafetySection({ data }: { data: any }) {
    const s = data?.safety || {};
    if (Object.keys(s).length === 0) return <EmptyState />;

    return (
        <div className="space-y-6">
            <SectionTitle title="Safety Compliance" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                    ["Disaster Management Plan",  s.has_disaster_plan],
                    ["Structural Safety Audit",   s.has_structural_audit],
                    ["CCTV Cameras",              s.has_cctv],
                    ["Fire Extinguishers",        s.has_fire_extinguishers],
                    ["Nodal Safety Teacher",      s.has_nodal_teacher],
                    ["Safety Training",           s.has_safety_training],
                    ["Safety Display Board",      s.has_safety_display_board],
                    ["First Level Counselor",     s.has_first_level_counselor],
                    ["Disaster Mgmt in Curriculum", s.disaster_management_taught],
                    ["Self Defence Grant (Girls)", s.has_self_defence_grant],
                ].map(([label, value], i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-100">
                        <span className="text-sm text-slate-600">{label as string}</span>
                        {yesNo(value)}
                    </div>
                ))}
            </div>

            <SectionTitle title="Safety Audit Details" />
            <InfoGrid rows={[
                ["Safety Training Date",   val(s.safety_training_date)],
                ["Audit Frequency",        val(s.safety_audit_frequency)],
                ["Self Defence – Upper Primary", val(s.self_defence_upper_primary)],
                ["Self Defence – Secondary",     val(s.self_defence_secondary)],
                ["Self Defence – Higher Sec.",   val(s.self_defence_higher_secondary)],
            ]} />
        </div>
    );
}

function StudentCapacitySection({ data }: { data: any }) {
    const configs = data?.section_configs || [];
    const students = data?.students || [];

    if (configs.length === 0 && students.length === 0) return <EmptyState />;

    return (
        <div className="space-y-6">
            <SectionTitle title="Section Configuration" />
            {configs.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                            <tr>
                                <th className="px-4 py-2 text-left">Class / Grade</th>
                                <th className="px-4 py-2 text-center">No. of Sections</th>
                                <th className="px-4 py-2 text-left">Section Names</th>
                            </tr>
                        </thead>
                        <tbody>
                            {configs.map((c: any, i: number) => (
                                <tr key={i} className="border-t border-slate-100">
                                    <td className="px-4 py-2 font-medium">{val(c.class_name || c.className)}</td>
                                    <td className="px-4 py-2 text-center">{val(c.number_of_sections || c.numberOfSections)}</td>
                                    <td className="px-4 py-2">
                                        <div className="flex flex-wrap gap-1">
                                            {(c.section_names || c.sectionNames || []).map((n: string, j: number) => (
                                                <Badge key={j} text={n} color="blue" />
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-sm text-slate-400">No section configuration found.</p>
            )}

            {students.length > 0 && (
                <>
                    <SectionTitle title={`Enrolled Students (${students.length})`} />
                    <div className="space-y-3">
                        {students.slice(0, 20).map((s: any, i: number) => (
                            <div key={i} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                <div className="flex items-start justify-between flex-wrap gap-2">
                                    <div>
                                        <p className="font-bold text-slate-800">{val(s.name)}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Class {val(s.student_grade || s.studentGrade)} – Sec {val(s.student_section || s.studentSection)} · Roll {val(s.roll_number || s.rollNumber)}
                                        </p>
                                    </div>
                                    <div className="flex gap-1 flex-wrap">
                                        <Badge text={val(s.gender)} color="purple" />
                                        {(s.is_cwsn || s.isCWSN) === "1-Yes" && <Badge text="CWSN" color="amber" />}
                                        {(s.is_bpl || s.isBPL) === "1-Yes" && <Badge text="BPL" color="red" />}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {students.length > 20 && (
                            <p className="text-xs text-slate-400 text-center py-2">
                                Showing first 20 of {students.length} students
                            </p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

function VocationalSection({ data }: { data: any }) {
    const ve = data?.vocational_education || {};
    const labs = data?.vocational_labs || [];

    if (Object.keys(ve).length === 0 && labs.length === 0) return <EmptyState />;

    return (
        <div className="space-y-6">
            <SectionTitle title="Industry Engagement" />
            <InfoGrid rows={[
                ["Guest Lecturers",      val(ve.vocational_guest_lecturers)],
                ["Industry Visits",      val(ve.vocational_industry_visits)],
                ["Industry Linkages",    val(ve.vocational_industry_linkages)],
            ]} />

            <SectionTitle title="Placements – Class 10" />
            <InfoGrid rows={[
                ["Enrolled",            val(ve.plac_enrolled_10)],
                ["Passed / Certified",  val(ve.plac_passed_10)],
                ["Self-Employed",       val(ve.plac_self_emp_10)],
                ["Placed / Apprentice", val(ve.plac_placed_10)],
            ]} />

            <SectionTitle title="Placements – Class 12" />
            <InfoGrid rows={[
                ["Enrolled",            val(ve.plac_enrolled_12)],
                ["Passed / Certified",  val(ve.plac_passed_12)],
                ["Self-Employed",       val(ve.plac_self_emp_12)],
                ["Placed / Apprentice", val(ve.plac_placed_12)],
            ]} />

            {labs.length > 0 && (
                <>
                    <SectionTitle title="Vocational Labs" />
                    <div className="overflow-x-auto rounded-xl border border-slate-100">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-2 text-left">Sector</th>
                                    <th className="px-4 py-2 text-left">Condition</th>
                                    <th className="px-4 py-2 text-center">Separate Room</th>
                                </tr>
                            </thead>
                            <tbody>
                                {labs.map((l: any, i: number) => (
                                    <tr key={i} className="border-t border-slate-100">
                                        <td className="px-4 py-2">{val(l.sector)}</td>
                                        <td className="px-4 py-2">{val(l.condition)}</td>
                                        <td className="px-4 py-2 text-center">{yesNo(l.separate_room || l.separateRoom)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}

function TransportSection({ data }: { data: any }) {
    const t = data?.transport || {};
    if (Object.keys(t).length === 0) return <EmptyState />;

    return (
        <div className="space-y-6">
            <SectionTitle title="Vehicle & Driver Details" />
            <InfoGrid rows={[
                ["Vehicle Age (years)",      val(t.trans_vehicle_age)],
                ["Speed Governor",           yesNo(t.trans_speed_governor)],
                ["School Name on Bus",       yesNo(t.trans_school_name_written)],
                ["Driver Experience",        val(t.trans_driver_experience)],
                ["No Traffic Offences",      yesNo(t.trans_driver_no_traffic_offences)],
                ["Auto Safety Measures",     yesNo(t.trans_auto_safety)],
            ]} />

            <SectionTitle title="Documents" />
            <div className="flex flex-col gap-3">
                {t.fitness_cert_url ? (
                    <a
                        href={t.fitness_cert_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                        <FileText className="w-4 h-4" />
                        View Fitness Certificate
                    </a>
                ) : (
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-400">
                        <FileText className="w-4 h-4" />
                        Fitness Certificate – Not Uploaded
                    </div>
                )}
                {t.permit_url ? (
                    <a
                        href={t.permit_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                        <FileText className="w-4 h-4" />
                        View Transport Permit
                    </a>
                ) : (
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-400">
                        <FileText className="w-4 h-4" />
                        Transport Permit – Not Uploaded
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function ProfileBookletModal({
    isOpen,
    onClose,
    schoolName,
    udiseCode,
    schoolId,
    mode = "view",
}: ProfileBookletModalProps) {
    const [activeSection, setActiveSection] = useState("basic_details");
    const [profile, setProfile]             = useState<any>(null);
    const [loading, setLoading]             = useState(false);
    const [error, setError]                 = useState<string | null>(null);
    const [expanded, setExpanded]           = useState(false);

    // ── Fetch full profile ──────────────────────────────────────────────────
    const fetchProfile = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const raw = localStorage.getItem("user");
            if (!raw) throw new Error("Not authenticated");
            const { access_token } = JSON.parse(raw);

            const res = await fetch(
                `${API_BASE_URL}/admin/schools/${schoolId}/profile`,
                { headers: { Authorization: `Bearer ${access_token}` } },
            );
            if (!res.ok) throw new Error(`Server returned ${res.status}`);
            const data = await res.json();
            setProfile(data);
        } catch (err: any) {
            setError(err.message ?? "Failed to load profile");
        } finally {
            setLoading(false);
        }
    }, [schoolId]);

    useEffect(() => {
        if (isOpen && schoolId) {
            setActiveSection("basic_details");
            fetchProfile();
        }
    }, [isOpen, schoolId, fetchProfile]);

    if (!isOpen) return null;

    // ── Section content router ──────────────────────────────────────────────
    const renderSection = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center h-full gap-4 py-24">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                    <p className="text-sm text-slate-500">Loading profile data…</p>
                </div>
            );
        }
        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-full gap-3 py-24 text-rose-500">
                    <AlertCircle className="w-10 h-10" />
                    <p className="text-sm font-semibold">{error}</p>
                    <button
                        onClick={fetchProfile}
                        className="mt-2 px-4 py-2 bg-rose-50 border border-rose-200 rounded-lg text-sm font-bold hover:bg-rose-100 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            );
        }
        if (!profile) return <EmptyState message="No profile data loaded." />;

        switch (activeSection) {
            case "basic_details":        return <BasicDetailsSection   data={profile} />;
            case "receipts_expenditure": return <ReceiptsSection       data={profile} />;
            case "legal_details":        return <LegalDetailsSection   data={profile} />;
            case "location":             return <LocationSection        data={profile} />;
            case "infrastructure":       return <InfrastructureSection data={profile} />;
            case "staff":                return <StaffSection           data={profile} />;
            case "safety":               return <SafetySection          data={profile} />;
            case "student_capacity":     return <StudentCapacitySection data={profile} />;
            case "vocational_education": return <VocationalSection      data={profile} />;
            case "transport":            return <TransportSection       data={profile} />;
            default:                     return <EmptyState />;
        }
    };

    const activeNavItem = NAV_SECTIONS.find(n => n.id === activeSection);

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={`fixed z-50 bg-white shadow-2xl flex flex-col transition-all duration-300 ${
                    expanded
                        ? "inset-4 rounded-2xl"
                        : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-5xl h-[90vh] rounded-2xl"
                }`}
            >
                {/* ── Header ── */}
                <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-100 shrink-0">
                    <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20 shrink-0">
                        <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-base font-black text-slate-900 truncate">{schoolName}</h2>
                        <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs text-slate-400">UDISE: <span className="font-bold text-slate-600">{udiseCode || "—"}</span></span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wider">
                                {mode === "verify" ? "Verify Mode" : "Profile Booklet View"}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => setExpanded(e => !e)}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                            title={expanded ? "Restore" : "Expand"}
                        >
                            <Maximize2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="flex flex-1 min-h-0">
                    {/* Left nav */}
                    <nav className="w-56 shrink-0 border-r border-slate-100 overflow-y-auto py-3 bg-slate-50/50">
                        {NAV_SECTIONS.map(section => {
                            const Icon = section.icon;
                            const active = activeSection === section.id;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-all text-left ${
                                        active
                                            ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                    }`}
                                >
                                    <Icon className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{section.label}</span>
                                    {active && <ChevronRight className="w-3.5 h-3.5 ml-auto shrink-0" />}
                                </button>
                            );
                        })}
                    </nav>

                    {/* Content pane */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="px-8 py-6">
                            {/* Section header */}
                            <div className="mb-6 pb-4 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    {activeNavItem && <activeNavItem.icon className="w-5 h-5 text-blue-600" />}
                                    <h2 className="text-lg font-black text-slate-900">{activeNavItem?.label}</h2>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">
                                    Review accurate data from official school records.
                                </p>
                            </div>
                            {renderSection()}
                        </div>
                    </div>
                </div>

                {/* ── Footer (verify mode) ── */}
                {mode === "verify" && !loading && profile && (
                    <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-between gap-4 shrink-0 bg-slate-50/50">
                        <p className="text-xs text-slate-500">
                            Use the buttons to approve or reject this school's application.
                        </p>
                        <div className="flex gap-3">
                            <button className="px-5 py-2.5 rounded-xl text-sm font-bold bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-colors">
                                Reject Application
                            </button>
                            <button className="px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-colors">
                                Approve Application
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}