"use strict";

const SCHEMA_VERSION = 1;
const STORAGE_KEY = "reportManager.workspace";
const PRIVACY_KEY = "reportManager.privacy";
const TASK_STATUSES = ["Not Started", "In Progress", "Completed"];
const REPORT_STATUSES = ["Draft", "Submitted", "Approved", "Needs Changes"];
const AUTO_LOCK_OPTIONS = [0, 5, 15, 30, 60];

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const now = () => new Date().toISOString();
const uid = (prefix) => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
const escapeHTML = (value = "") => String(value).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
const currentMonth = () => new Date().toISOString().slice(0, 7);
const monthLabel = value => value ? new Date(`${value}-02T12:00:00`).toLocaleDateString("en-AU", {month: "long", year: "numeric"}) : "No month";
const dateLabel = value => value ? new Date(`${value}T12:00:00`).toLocaleDateString("en-AU", {day: "numeric", month: "short", year: "numeric"}) : "—";
const timestampLabel = value => value ? new Date(value).toLocaleString("en-AU", {dateStyle: "medium", timeStyle: "short"}) : "—";

const makeSampleWorkspace = () => {
  const created = "2026-06-10T09:00:00.000Z";
  return {
    schemaVersion: SCHEMA_VERSION,
    workspaceId: "workspace_community_impact",
    workspaceName: "Community Impact Programs",
    selectedReportingMonth: "2026-07",
    createdAt: created,
    updatedAt: created,
    projects: [
      {id:"project_youth", name:"Youth Pathways Program", fundingBody:"Victorian Community Fund", startDate:"2026-01-01", endDate:"2026-12-31", description:"Mentoring, skills workshops and employment pathways for young people.", isArchived:false, archivedAt:null, createdAt:created, updatedAt:created},
      {id:"project_food", name:"Neighbourhood Food Security", fundingBody:"City Community Grants", startDate:"2026-04-01", endDate:"2027-03-31", description:"Community pantry coordination, food relief referrals and nutrition activities.", isArchived:false, archivedAt:null, createdAt:created, updatedAt:created},
      {id:"project_digital", name:"Digital Inclusion Clinics", fundingBody:"Regional Access Foundation", startDate:"2025-07-01", endDate:"2026-06-30", description:"Digital confidence clinics for older residents.", isArchived:true, archivedAt:"2026-07-01T00:00:00.000Z", createdAt:created, updatedAt:"2026-07-01T00:00:00.000Z"}
    ],
    staff: [
      {id:"staff_amira", name:"Amira Khan", role:"Program Coordinator", email:"amira@example.org", isArchived:false, archivedAt:null, createdAt:created, updatedAt:created},
      {id:"staff_luke", name:"Luke Bennett", role:"Community Development Worker", email:"luke@example.org", isArchived:false, archivedAt:null, createdAt:created, updatedAt:created},
      {id:"staff_mei", name:"Mei Chen", role:"Youth Engagement Officer", email:"mei@example.org", isArchived:false, archivedAt:null, createdAt:created, updatedAt:created},
      {id:"staff_rosa", name:"Rosa Martinez", role:"Volunteer Coordinator", email:"rosa@example.org", isArchived:true, archivedAt:"2026-06-30T00:00:00.000Z", createdAt:created, updatedAt:"2026-06-30T00:00:00.000Z"}
    ],
    tasks: [
      {id:"task_1", title:"Deliver school holiday workshop", description:"Run the two-day employment readiness workshop.", projectId:"project_youth", staffId:"staff_mei", reportingMonth:"2026-07", status:"Completed", createdAt:created, updatedAt:"2026-07-15T05:00:00.000Z"},
      {id:"task_2", title:"Confirm mentor matches", description:"Complete matching for the new participant cohort.", projectId:"project_youth", staffId:"staff_amira", reportingMonth:"2026-07", status:"In Progress", createdAt:created, updatedAt:created},
      {id:"task_3", title:"Update pantry referral directory", description:"Verify opening hours and eligibility details.", projectId:"project_food", staffId:"staff_luke", reportingMonth:"2026-07", status:"Not Started", createdAt:created, updatedAt:created},
      {id:"task_4", title:"Volunteer roster", description:"Prepare the August pantry roster.", projectId:"project_food", staffId:"staff_rosa", reportingMonth:"2026-07", status:"Completed", createdAt:created, updatedAt:created},
      {id:"task_5", title:"Final clinic evaluation", description:"Collate participant feedback from the final clinics.", projectId:"project_digital", staffId:"staff_amira", reportingMonth:"2026-06", status:"Completed", createdAt:created, updatedAt:created}
    ],
    reports: [
      {id:"report_1", projectId:"project_youth", staffId:"staff_mei", reportingMonth:"2026-07", activitiesCompleted:"Delivered two employment-readiness workshops with 18 participants.", outcomes:"Fourteen participants completed an individual action plan and six requested mentor introductions.", challenges:"Two participants required additional transport assistance.", nextSteps:"Follow up action plans and coordinate August mentor introductions.", additionalNotes:"Participant feedback was strongly positive.", reviewStatus:"Approved", supervisorComments:"Clear outcomes and participant numbers. Approved.", submittedAt:"2026-07-18T04:00:00.000Z", reviewedAt:"2026-07-19T02:00:00.000Z", createdAt:created, updatedAt:"2026-07-19T02:00:00.000Z"},
      {id:"report_2", projectId:"project_youth", staffId:"staff_amira", reportingMonth:"2026-07", activitiesCompleted:"Completed intake conversations and began mentor matching.", outcomes:"Eight of twelve new participants have a proposed mentor match.", challenges:"Availability is limited for weekday afternoon meetings.", nextSteps:"Confirm remaining matches and schedule orientation.", additionalNotes:"", reviewStatus:"Submitted", supervisorComments:"", submittedAt:"2026-07-20T06:00:00.000Z", reviewedAt:null, createdAt:created, updatedAt:"2026-07-20T06:00:00.000Z"},
      {id:"report_3", projectId:"project_food", staffId:"staff_luke", reportingMonth:"2026-07", activitiesCompleted:"Reviewed 22 directory entries and contacted seven partner agencies.", outcomes:"", challenges:"Several agencies have not confirmed updated eligibility information.", nextSteps:"Follow up outstanding agencies.", additionalNotes:"Waiting on council service directory updates.", reviewStatus:"Needs Changes", supervisorComments:"Please add a measurable outcome and clarify how many directory entries were updated.", submittedAt:"2026-07-17T03:00:00.000Z", reviewedAt:"2026-07-18T01:30:00.000Z", createdAt:created, updatedAt:"2026-07-18T01:30:00.000Z"},
      {id:"report_4", projectId:"project_food", staffId:"staff_rosa", reportingMonth:"2026-07", activitiesCompleted:"Prepared a draft volunteer roster and contacted returning volunteers.", outcomes:"Nine volunteers confirmed availability.", challenges:"", nextSteps:"Fill two remaining shifts.", additionalNotes:"", reviewStatus:"Draft", supervisorComments:"", submittedAt:null, reviewedAt:null, createdAt:created, updatedAt:created}
    ]
  };
};

let workspaceLoadError = null;
let workspace = loadWorkspace();
let privacy = loadPrivacy();
let currentView = "dashboard";
let viewState = {};
let dialogContext = null;
let inactivityTimer = null;
let isLocked = Boolean(privacy.pinHash);
const dirtyForms = new Set();
const formBaselines = new Map();

function loadWorkspace() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return makeSampleWorkspace();
    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object") throw new Error("The stored workspace is not a valid data object.");
    return migrateWorkspace(parsed);
  } catch (error) {
    workspaceLoadError = error instanceof Error ? error.message : "Unknown data error.";
    return null;
  }
}

function migrateWorkspace(data) {
  const version = Number(data.schemaVersion || 0);
  if (version > SCHEMA_VERSION) throw new Error("This workspace was created by a newer version of Report Manager.");
  if (version === 0) data.schemaVersion = 1;
  data.workspaceName ??= "";
  data.projects ??= [];
  data.staff ??= [];
  data.tasks ??= [];
  data.reports ??= [];
  data.reports.forEach(report => { report.additionalNotes ??= ""; });
  data.schemaVersion = SCHEMA_VERSION;
  return data;
}

function loadPrivacy() {
  try {
    return {...{pinHash:"", pinSalt:"", autoLockMinutes:0, privacySettingsVersion:1}, ...JSON.parse(localStorage.getItem(PRIVACY_KEY) || "{}")};
  } catch {
    return {pinHash:"", pinSalt:"", autoLockMinutes:0, privacySettingsVersion:1};
  }
}

function saveWorkspace() {
  workspace.updatedAt = now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
}

function hasUnsavedChanges() {
  return dirtyForms.size > 0;
}

function confirmDiscardChanges() {
  if (!hasUnsavedChanges()) return true;
  if (!confirm("You have unsaved changes. Leave without saving them?")) return false;
  dirtyForms.clear();
  return true;
}

function markFormDirty(form) {
  if (!["entity-form", "workspace-settings", "privacy-settings"].includes(form?.id)) return;
  if (formSnapshot(form) === formBaselines.get(form.id)) dirtyForms.delete(form.id);
  else dirtyForms.add(form.id);
}

function formSnapshot(form) {
  return JSON.stringify([...new FormData(form).entries()]);
}

function setFormBaseline(form) {
  if (!form) return;
  formBaselines.set(form.id, formSnapshot(form));
  dirtyForms.delete(form.id);
}

function showWorkspaceLoadError() {
  $("#app").classList.add("hidden");
  $("#lock-screen").classList.add("hidden");
  $("#workspace-error-screen").classList.remove("hidden");
  $("#workspace-error-reason").textContent = workspaceLoadError ? `Reason: ${workspaceLoadError}` : "The stored workspace is unreadable or incompatible.";
}

function activateRecoveredWorkspace() {
  workspaceLoadError = null;
  dirtyForms.clear();
  $("#workspace-error-screen").classList.add("hidden");
  $("#app").classList.remove("hidden");
  updateChrome();
  navigate("dashboard", {}, {skipUnsavedCheck:true});
  if (privacy.pinHash) lockWorkspace(); else resetInactivityTimer();
}

function savePrivacy() {
  localStorage.setItem(PRIVACY_KEY, JSON.stringify(privacy));
  resetInactivityTimer();
}

function projectFor(id) { return workspace.projects.find(item => item.id === id); }
function staffFor(id) { return workspace.staff.find(item => item.id === id); }

function statusClass(status) {
  return ({"Completed":"completed", "In Progress":"progress", "Submitted":"submitted", "Approved":"approved", "Needs Changes":"changes", "Draft":"draft"})[status] || "";
}

function statusBadge(status) {
  return `<span class="status ${statusClass(status)}">${escapeHTML(status)}</span>`;
}

function toast(message, type = "success") {
  const el = document.createElement("div");
  el.className = `toast ${type === "error" ? "error" : ""}`;
  el.textContent = message;
  $("#toast-region").append(el);
  setTimeout(() => el.remove(), 3600);
}

function updateChrome() {
  const name = workspace.workspaceName?.trim() || "Local workspace";
  $("#workspace-name-side").textContent = name;
  $("#workspace-name-header").textContent = name;
  $("#global-month").value = workspace.selectedReportingMonth;
  const titles = {dashboard:"Dashboard",projects:"Projects",projectDetail:"Project details",staff:"Staff",staffDetail:"Staff details",tasks:"Monthly tasks",reports:"Monthly reports",reportDetail:"Monthly report",backup:"Backup & Restore",settings:"Settings"};
  $("#page-title").textContent = titles[currentView] || "Report Manager";
  $$(".nav-item").forEach(btn => btn.classList.toggle("active", btn.dataset.view === currentView || (currentView === "projectDetail" && btn.dataset.view === "projects") || (currentView === "staffDetail" && btn.dataset.view === "staff") || (currentView === "reportDetail" && btn.dataset.view === "reports")));
  const quick = $("#quick-action");
  const quickMap = {dashboard:["New task","task"],projects:["New project","project"],projectDetail:["New task","task"],staff:["New staff member","staff"],staffDetail:["New task","task"],tasks:["New task","task"],reports:["New report","report"],reportDetail:["New report","report"]};
  if (quickMap[currentView]) {
    quick.classList.remove("hidden");
    quick.textContent = quickMap[currentView][0];
    quick.dataset.entity = quickMap[currentView][1];
  } else quick.classList.add("hidden");
}

function navigate(view, state = {}, options = {}) {
  if (!options.skipUnsavedCheck && !confirmDiscardChanges()) return false;
  currentView = view;
  viewState = state;
  updateChrome();
  render();
  $("#main-content").focus({preventScroll:true});
  $("#sidebar").classList.remove("open");
  return true;
}

function render() {
  const renders = {dashboard:renderDashboard, projects:renderProjects, projectDetail:renderProjectDetail, staff:renderStaff, staffDetail:renderStaffDetail, tasks:renderTasks, reports:renderReports, reportDetail:renderReportDetail, backup:renderBackup, settings:renderSettings};
  $("#main-content").innerHTML = (renders[currentView] || renderDashboard)();
  setFormBaseline($("#workspace-settings"));
  setFormBaseline($("#privacy-settings"));
}

function renderDashboard() {
  const month = workspace.selectedReportingMonth;
  const tasks = workspace.tasks.filter(item => item.reportingMonth === month);
  const reports = workspace.reports.filter(item => item.reportingMonth === month);
  const metrics = [
    ["Active projects", workspace.projects.filter(item => !item.isArchived).length, "All current projects", "projects", "", ""],
    ["Active staff", workspace.staff.filter(item => !item.isArchived).length, "Current staff records", "staff", "", ""],
    ["Tasks completed", tasks.filter(item => item.status === "Completed").length, monthLabel(month), "tasks", "", "Completed"],
    ["Tasks pending", tasks.filter(item => item.status !== "Completed").length, "Not started or in progress", "tasks", "warn", "Pending"],
    ["Reports needing review", reports.filter(item => item.reviewStatus === "Submitted").length, "Submitted and awaiting review", "reports", "warn", "Submitted"],
    ["Reports needing changes", reports.filter(item => item.reviewStatus === "Needs Changes").length, "Returned for revision", "reports", "alert", "Needs Changes"]
  ];
  const attention = reports.filter(r => ["Submitted","Needs Changes"].includes(r.reviewStatus));
  return `
    <div class="view-head"><div><p class="eyebrow">${escapeHTML(monthLabel(month))}</p><h2>Welcome to ${escapeHTML(workspace.workspaceName || "your workspace")}</h2><p>Your monthly project reporting at a glance.</p></div></div>
    <section class="metric-grid" aria-label="Dashboard summary">
      ${metrics.map(([label,value,note,view,klass,status]) => `<button class="metric-card ${klass}" data-dashboard-nav="${view}" data-dashboard-status="${status}"><span class="metric-label">${label}</span><span class="metric-value">${value}</span><span class="metric-note">${note}</span></button>`).join("")}
    </section>
    <section class="dashboard-lower">
      <div class="panel"><div class="panel-head"><h3>Reports requiring attention</h3><button class="small-button" data-nav="reports">View all</button></div>
        <div class="activity-list">${attention.length ? attention.map(report => `<div class="activity-row"><div><strong>${escapeHTML(projectFor(report.projectId)?.name || "Unknown project")}</strong><small>${escapeHTML(staffFor(report.staffId)?.name || "Unknown staff")} · ${monthLabel(report.reportingMonth)}</small></div><div>${statusBadge(report.reviewStatus)} <button class="small-button" data-report-open="${report.id}">Open</button></div></div>`).join("") : emptyInline("No reports need attention", "Submitted and returned reports will appear here.")}</div>
      </div>
      <div class="panel"><div class="panel-head"><h3>Task progress</h3></div><div class="summary-list">
        ${TASK_STATUSES.map(status => `<div class="summary-row"><span>${status}</span><strong>${tasks.filter(t => t.status === status).length}</strong></div>`).join("")}
        <div class="summary-row"><span>Total tasks</span><strong>${tasks.length}</strong></div>
      </div></div>
    </section>`;
}

function renderProjects() {
  const archived = viewState.archived === true;
  const search = (viewState.search || "").toLowerCase();
  const items = workspace.projects.filter(p => p.isArchived === archived && (!search || `${p.name} ${p.fundingBody}`.toLowerCase().includes(search)));
  return `
    <div class="view-head"><div><h2>${archived ? "Archived projects" : "Projects"}</h2><p>Manage funded programs and preserve their reporting history.</p></div><button class="primary-button" data-new="project">New project</button></div>
    <div class="toolbar"><input class="search" id="project-search" type="search" placeholder="Search projects" value="${escapeHTML(viewState.search || "")}"><button class="secondary-button" data-project-archive-filter>${archived ? "Show active" : "Show archived"}</button></div>
    <div class="record-table-wrap"><table class="record-table"><thead><tr><th>Project</th><th>Funding period</th><th>Related records</th><th><span class="hidden">Actions</span></th></tr></thead><tbody>
      ${items.map(p => { const refs = workspace.tasks.filter(t=>t.projectId===p.id).length + workspace.reports.filter(r=>r.projectId===p.id).length; return `<tr><td><div class="record-title">${escapeHTML(p.name)} ${p.isArchived ? '<span class="status archived">Archived</span>' : ''}</div><div class="record-sub">${escapeHTML(p.fundingBody)}</div></td><td>${dateLabel(p.startDate)} – ${dateLabel(p.endDate)}</td><td>${refs} task/report record${refs===1?"":"s"}</td><td><div class="actions"><button class="small-button" data-project-open="${p.id}">View</button><button class="small-button" data-project-edit="${p.id}">Edit</button><button class="small-button" data-project-archive="${p.id}">${p.isArchived?"Restore":"Archive"}</button>${refs===0?`<button class="small-button danger" data-project-delete="${p.id}">Delete</button>`:""}</div></td></tr>`; }).join("") || tableEmpty(4, archived ? "No archived projects" : "No projects found")}
    </tbody></table></div>`;
}

function renderProjectDetail() {
  const p = projectFor(viewState.id);
  if (!p) return missingRecord("Project not found", "projects");
  const tasks = workspace.tasks.filter(t => t.projectId === p.id).sort((a,b)=>b.reportingMonth.localeCompare(a.reportingMonth));
  const reports = workspace.reports.filter(r => r.projectId === p.id).sort((a,b)=>b.reportingMonth.localeCompare(a.reportingMonth));
  return `<div class="view-head"><div><p class="eyebrow">Project ${p.isArchived ? "· Archived" : ""}</p><h2>${escapeHTML(p.name)}</h2><p>${escapeHTML(p.fundingBody)}</p></div><div><button class="secondary-button" data-nav="projects">Back</button> <button class="primary-button" data-project-edit="${p.id}">Edit project</button></div></div>
    <div class="detail-grid"><dl class="detail-card"><dt>Funding period</dt><dd>${dateLabel(p.startDate)} – ${dateLabel(p.endDate)}</dd><dt>Description</dt><dd>${escapeHTML(p.description || "No description")}</dd><dt>Created</dt><dd>${timestampLabel(p.createdAt)}</dd><dt>Last updated</dt><dd>${timestampLabel(p.updatedAt)}</dd></dl>
    <div class="detail-card"><h3>Project snapshot</h3><div class="summary-row"><span>Tasks</span><strong>${tasks.length}</strong></div><div class="summary-row"><span>Completed tasks</span><strong>${tasks.filter(t=>t.status==="Completed").length}</strong></div><div class="summary-row"><span>Reports</span><strong>${reports.length}</strong></div><div class="summary-row"><span>Approved reports</span><strong>${reports.filter(r=>r.reviewStatus==="Approved").length}</strong></div></div></div>
    <div class="panel" style="margin-top:18px"><div class="panel-head"><h3>Recent tasks</h3><button class="small-button" data-filter-tasks-project="${p.id}">View all</button></div>${tasks.slice(0,5).map(t=>`<div class="activity-row"><div><strong>${escapeHTML(t.title)}</strong><small>${monthLabel(t.reportingMonth)} · ${escapeHTML(staffFor(t.staffId)?.name || "Unknown staff")}</small></div>${statusBadge(t.status)}</div>`).join("") || emptyInline("No tasks", "Create the first task for this project.")}</div>
    <div class="panel" style="margin-top:18px"><div class="panel-head"><h3>Recent reports</h3><button class="small-button" data-filter-reports-project="${p.id}">View all</button></div>${reports.slice(0,5).map(r=>`<div class="activity-row"><div><strong>${escapeHTML(staffFor(r.staffId)?.name || "Unknown staff")}</strong><small>${monthLabel(r.reportingMonth)}</small></div><div>${statusBadge(r.reviewStatus)} <button class="small-button" data-report-open="${r.id}">Open</button></div></div>`).join("") || emptyInline("No reports", "Create the first report for this project.")}</div>`;
}

function renderStaff() {
  const archived = viewState.archived === true;
  const search = (viewState.search || "").toLowerCase();
  const items = workspace.staff.filter(s => s.isArchived === archived && (!search || `${s.name} ${s.role} ${s.email}`.toLowerCase().includes(search)));
  return `<div class="view-head"><div><h2>${archived ? "Archived staff" : "Staff"}</h2><p>Staff are local organisational records and do not have accounts.</p></div><button class="primary-button" data-new="staff">New staff member</button></div>
    <div class="toolbar"><input class="search" id="staff-search" type="search" placeholder="Search staff" value="${escapeHTML(viewState.search || "")}"><button class="secondary-button" data-staff-archive-filter>${archived ? "Show active" : "Show archived"}</button></div>
    <div class="record-table-wrap"><table class="record-table"><thead><tr><th>Staff member</th><th>Contact</th><th>Related records</th><th><span class="hidden">Actions</span></th></tr></thead><tbody>
    ${items.map(s=>{ const refs=workspace.tasks.filter(t=>t.staffId===s.id).length+workspace.reports.filter(r=>r.staffId===s.id).length; return `<tr><td><div class="record-title">${escapeHTML(s.name)} ${s.isArchived ? '<span class="status archived">Archived</span>' : ''}</div><div class="record-sub">${escapeHTML(s.role)}</div></td><td>${escapeHTML(s.email)}</td><td>${refs} task/report record${refs===1?"":"s"}</td><td><div class="actions"><button class="small-button" data-staff-open="${s.id}">View</button><button class="small-button" data-staff-edit="${s.id}">Edit</button><button class="small-button" data-staff-archive="${s.id}">${s.isArchived?"Restore":"Archive"}</button>${refs===0?`<button class="small-button danger" data-staff-delete="${s.id}">Delete</button>`:""}</div></td></tr>`}).join("") || tableEmpty(4, archived ? "No archived staff" : "No staff found")}
    </tbody></table></div>`;
}

function renderStaffDetail() {
  const s = staffFor(viewState.id);
  if (!s) return missingRecord("Staff member not found", "staff");
  const tasks = workspace.tasks.filter(t=>t.staffId===s.id);
  const reports = workspace.reports.filter(r=>r.staffId===s.id);
  return `<div class="view-head"><div><p class="eyebrow">Staff record ${s.isArchived ? "· Archived" : ""}</p><h2>${escapeHTML(s.name)}</h2><p>${escapeHTML(s.role)}</p></div><div><button class="secondary-button" data-nav="staff">Back</button> <button class="primary-button" data-staff-edit="${s.id}">Edit staff</button></div></div>
    <div class="detail-grid"><dl class="detail-card"><dt>Email</dt><dd><a href="mailto:${escapeHTML(s.email)}">${escapeHTML(s.email)}</a></dd><dt>Created</dt><dd>${timestampLabel(s.createdAt)}</dd><dt>Last updated</dt><dd>${timestampLabel(s.updatedAt)}</dd></dl><div class="detail-card"><h3>Activity snapshot</h3><div class="summary-row"><span>Assigned tasks</span><strong>${tasks.length}</strong></div><div class="summary-row"><span>Completed tasks</span><strong>${tasks.filter(t=>t.status==="Completed").length}</strong></div><div class="summary-row"><span>Reports</span><strong>${reports.length}</strong></div></div></div>
    <div class="panel" style="margin-top:18px"><div class="panel-head"><h3>Recent activity</h3></div>${[...tasks.map(t=>({date:t.reportingMonth,title:t.title,meta:projectFor(t.projectId)?.name,status:t.status})),...reports.map(r=>({date:r.reportingMonth,title:`Monthly report · ${monthLabel(r.reportingMonth)}`,meta:projectFor(r.projectId)?.name,status:r.reviewStatus}))].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,8).map(item=>`<div class="activity-row"><div><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(item.meta||"Unknown project")}</small></div>${statusBadge(item.status)}</div>`).join("") || emptyInline("No activity", "Tasks and reports will appear here.")}</div>`;
}

function renderTasks() {
  const filters = {project:viewState.project||"",staff:viewState.staff||"",status:viewState.status||""};
  const items=workspace.tasks.filter(t=>t.reportingMonth===workspace.selectedReportingMonth && (!filters.project||t.projectId===filters.project) && (!filters.staff||t.staffId===filters.staff) && (!filters.status||(filters.status==="Pending"?t.status!=="Completed":t.status===filters.status)));
  return `<div class="view-head"><div><p class="eyebrow">${monthLabel(workspace.selectedReportingMonth)}</p><h2>Monthly tasks</h2><p>Assign work and track delivery for the selected reporting month.</p></div><button class="primary-button" data-new="task">New task</button></div>
    <div class="toolbar">${filterSelect("task-project-filter","All projects",workspace.projects.map(p=>[p.id,p.name]),filters.project)}${filterSelect("task-staff-filter","All staff",workspace.staff.map(s=>[s.id,s.name]),filters.staff)}${filterSelect("task-status-filter","All statuses",[["Pending","Pending (Not Started or In Progress)"],...TASK_STATUSES.map(s=>[s,s])],filters.status)}</div>
    <div class="record-table-wrap"><table class="record-table"><thead><tr><th>Task</th><th>Project &amp; staff</th><th>Status</th><th><span class="hidden">Actions</span></th></tr></thead><tbody>${items.map(t=>`<tr><td><div class="record-title">${escapeHTML(t.title)}</div><div class="record-sub">${escapeHTML(t.description||"No description")}</div></td><td>${escapeHTML(projectFor(t.projectId)?.name||"Unknown project")}<div class="record-sub">${escapeHTML(staffFor(t.staffId)?.name||"Unknown staff")}</div></td><td><select class="small-button" data-task-status="${t.id}" aria-label="Status for ${escapeHTML(t.title)}">${TASK_STATUSES.map(status=>`<option ${t.status===status?"selected":""}>${status}</option>`).join("")}</select></td><td><div class="actions"><button class="small-button" data-task-edit="${t.id}">Edit</button><button class="small-button danger" data-task-delete="${t.id}">Delete</button></div></td></tr>`).join("")||tableEmpty(4,"No tasks for this month")}</tbody></table></div>`;
}

function renderReports() {
  const filters={project:viewState.project||"",staff:viewState.staff||"",status:viewState.status||""};
  const items=workspace.reports.filter(r=>r.reportingMonth===workspace.selectedReportingMonth&&(!filters.project||r.projectId===filters.project)&&(!filters.staff||r.staffId===filters.staff)&&(!filters.status||r.reviewStatus===filters.status));
  return `<div class="view-head"><div><p class="eyebrow">${monthLabel(workspace.selectedReportingMonth)}</p><h2>Monthly reports</h2><p>Prepare, submit and review staff reports.</p></div><button class="primary-button" data-new="report">New report</button></div>
    <div class="toolbar">${filterSelect("report-project-filter","All projects",workspace.projects.map(p=>[p.id,p.name]),filters.project)}${filterSelect("report-staff-filter","All staff",workspace.staff.map(s=>[s.id,s.name]),filters.staff)}${filterSelect("report-status-filter","All statuses",REPORT_STATUSES.map(s=>[s,s]),filters.status)}</div>
    <div class="record-table-wrap"><table class="record-table"><thead><tr><th>Project</th><th>Staff member</th><th>Status</th><th>Updated</th><th><span class="hidden">Actions</span></th></tr></thead><tbody>${items.map(r=>`<tr><td><div class="record-title">${escapeHTML(projectFor(r.projectId)?.name||"Unknown project")}</div><div class="record-sub">${monthLabel(r.reportingMonth)}</div></td><td>${escapeHTML(staffFor(r.staffId)?.name||"Unknown staff")}</td><td>${statusBadge(r.reviewStatus)}</td><td>${timestampLabel(r.updatedAt)}</td><td><div class="actions"><button class="small-button" data-report-open="${r.id}">Open</button></div></td></tr>`).join("")||tableEmpty(5,"No reports for this month")}</tbody></table></div>`;
}

function renderReportDetail() {
  const r=workspace.reports.find(item=>item.id===viewState.id);
  if(!r)return missingRecord("Report not found","reports");
  const editable=r.reviewStatus!=="Approved";
  return `<div class="view-head"><div><p class="eyebrow">${monthLabel(r.reportingMonth)} report</p><h2>${escapeHTML(projectFor(r.projectId)?.name||"Unknown project")}</h2><p>${escapeHTML(staffFor(r.staffId)?.name||"Unknown staff")}</p></div><div><button class="secondary-button" data-nav="reports">Back</button> ${editable?`<button class="primary-button" data-report-edit="${r.id}">Edit report</button>`:`<button class="ghost-button" data-report-reopen="${r.id}">Reopen as Draft</button>`}</div></div>
    <div class="review-banner ${r.reviewStatus==="Needs Changes"?"changes":""}"><div><strong>Review status</strong><div class="record-sub">Updated ${timestampLabel(r.updatedAt)}</div></div>${statusBadge(r.reviewStatus)}</div>
    <div class="detail-grid"><div class="detail-card">
      ${reportSection("Activities completed",r.activitiesCompleted)}${reportSection("Outcomes",r.outcomes)}${reportSection("Challenges",r.challenges)}${reportSection("Next steps",r.nextSteps)}${reportSection("Additional notes",r.additionalNotes||"No additional notes")}
    </div><div><div class="detail-card"><h3>Supervisor review</h3><div class="report-section"><h4>Comments</h4><p class="report-copy">${escapeHTML(r.supervisorComments||"No supervisor comments")}</p></div><div class="modal-actions" style="padding-bottom:0">
      ${r.reviewStatus==="Draft"?`<button class="primary-button" data-report-transition="Submitted" data-id="${r.id}">Submit report</button>`:""}
      ${r.reviewStatus==="Submitted"?`<button class="secondary-button" data-report-transition="Needs Changes" data-id="${r.id}">Needs changes</button><button class="primary-button" data-report-transition="Approved" data-id="${r.id}">Approve</button>`:""}
      ${r.reviewStatus==="Needs Changes"?`<button class="primary-button" data-report-transition="Submitted" data-id="${r.id}">Resubmit</button>`:""}
    </div></div><dl class="detail-card" style="margin-top:18px"><dt>Created</dt><dd>${timestampLabel(r.createdAt)}</dd><dt>Last updated</dt><dd>${timestampLabel(r.updatedAt)}</dd><dt>Submitted</dt><dd>${timestampLabel(r.submittedAt)}</dd><dt>Reviewed</dt><dd>${timestampLabel(r.reviewedAt)}</dd></dl></div></div>`;
}

function renderBackup() {
  return `<div class="view-head"><div><h2>Backup &amp; Restore</h2><p>Protect this local workspace by keeping regular JSON backups.</p></div></div><div class="settings-grid">
    <section class="settings-card"><div class="backup-icon">↓</div><h3>Export workspace</h3><p>Download projects, staff, tasks, reports and workspace preferences. Your PIN is never included.</p><button class="primary-button" id="export-backup">Export JSON backup</button></section>
    <section class="settings-card"><div class="backup-icon">↑</div><h3>Restore workspace</h3><p>Import a Report Manager backup. Its structure will be validated before any current data is replaced.</p><button class="secondary-button" id="choose-restore">Choose backup file</button></section>
    <section class="settings-card span-2"><h3>What is protected?</h3><p>All workspace information stays in this browser. Clearing browser data or losing this device can remove it permanently, so keep backup files somewhere safe.</p><div class="summary-row"><span>Schema version</span><strong>${workspace.schemaVersion}</strong></div><div class="summary-row"><span>Workspace last updated</span><strong>${timestampLabel(workspace.updatedAt)}</strong></div></section>
  </div>`;
}

function renderSettings() {
  return `<div class="view-head"><div><h2>Settings</h2><p>Manage workspace identity, privacy and local sample data.</p></div></div><div class="settings-grid">
    <form class="settings-card" id="workspace-settings"><h3>Workspace</h3><p>The optional name appears in the dashboard and application header.</p><label>Workspace name<input name="workspaceName" maxlength="80" value="${escapeHTML(workspace.workspaceName||"")}" placeholder="e.g. Community Impact Programs"></label><button class="primary-button" type="submit">Save workspace name</button></form>
    <form class="settings-card" id="privacy-settings"><h3>Privacy lock</h3><p>${privacy.pinHash?"A local PIN is active on this device.":"Create a PIN to discourage casual access when you step away."}</p><label>${privacy.pinHash?"New PIN (leave blank to keep current)":"Create PIN"}<input name="pin" type="password" inputmode="numeric" minlength="4" maxlength="12" pattern="[0-9]{4,12}" placeholder="4–12 digits"></label><label>Confirm PIN<input name="confirmPin" type="password" inputmode="numeric" minlength="4" maxlength="12" pattern="[0-9]{4,12}"></label><label>Auto-lock<select name="autoLock">${AUTO_LOCK_OPTIONS.map(value=>`<option value="${value}" ${Number(privacy.autoLockMinutes)===value?"selected":""}>${value===0?"Off":`${value} minutes`}</option>`).join("")}</select></label><button class="primary-button" type="submit">Save privacy settings</button> ${privacy.pinHash?'<button class="secondary-button" type="button" id="remove-pin">Remove PIN</button>':''}</form>
    <section class="settings-card"><h3>Lock now</h3><p>Hide workspace information immediately. Unlocking requires the local PIN.</p><button class="secondary-button" id="settings-lock" ${privacy.pinHash?"":"disabled"}>Lock workspace</button></section>
    <section class="settings-card danger-zone"><h3>Reset sample workspace</h3><p>Replace all workspace data with the original demonstration projects, staff, tasks and reports. Privacy settings remain unchanged.</p><button class="danger-button" id="reset-sample">Reset to sample data</button></section>
  </div>`;
}

function reportSection(title, value) { return `<div class="report-section"><h4>${title}</h4><p class="report-copy">${escapeHTML(value||"—")}</p></div>`; }
function tableEmpty(cols,text){return `<tr><td colspan="${cols}"><div class="empty-state"><strong>${text}</strong><span>Try changing the filters or add a new record.</span></div></td></tr>`;}
function emptyInline(title,text){return `<div class="empty-state"><strong>${title}</strong><span>${text}</span></div>`;}
function missingRecord(title,back){return `<div class="empty-state"><strong>${title}</strong><button class="secondary-button" data-nav="${back}">Return to list</button></div>`;}
function filterSelect(id,placeholder,options,value){return `<select id="${id}"><option value="">${placeholder}</option>${options.map(([v,l])=>`<option value="${escapeHTML(v)}" ${value===v?"selected":""}>${escapeHTML(l)}</option>`).join("")}</select>`;}
function optionList(items, selected, includeArchived=false){return items.filter(i=>includeArchived||!i.isArchived||i.id===selected).map(i=>`<option value="${i.id}" ${i.id===selected?"selected":""}>${escapeHTML(i.name)}${i.isArchived?" (Archived)":""}</option>`).join("");}

function openEntityDialog(type,id=null,extra={}) {
  const dialog=$("#entity-dialog");
  dialogContext={type,id};
  let body="", title="", eyebrow=id?"Edit record":"Create record", submit="Save";
  if(type==="project"){
    const item=id?projectFor(id):{}; title=id?"Edit project":"New project";
    body=`<label>Project name *<input name="name" required maxlength="120" value="${escapeHTML(item.name||"")}"></label><label>Funding body *<input name="fundingBody" required maxlength="120" value="${escapeHTML(item.fundingBody||"")}"></label><label>Start date *<input name="startDate" type="date" required value="${item.startDate||""}"></label><label>End date *<input name="endDate" type="date" required value="${item.endDate||""}"></label><label class="span-2">Description<textarea name="description" maxlength="1500">${escapeHTML(item.description||"")}</textarea></label>`;
  } else if(type==="staff"){
    const item=id?staffFor(id):{}; title=id?"Edit staff member":"New staff member";
    body=`<label>Name *<input name="name" required maxlength="100" value="${escapeHTML(item.name||"")}"></label><label>Role *<input name="role" required maxlength="100" value="${escapeHTML(item.role||"")}"></label><label class="span-2">Email *<input name="email" type="email" required maxlength="160" value="${escapeHTML(item.email||"")}"></label><p class="hint span-2">Staff members are records only. They do not receive accounts or login access.</p>`;
  } else if(type==="task"){
    const item=id?workspace.tasks.find(t=>t.id===id):{}; title=id?"Edit monthly task":"New monthly task";
    const projectId=item.projectId||extra.projectId||"",staffId=item.staffId||extra.staffId||"";
    body=`<label class="span-2">Task title *<input name="title" required maxlength="160" value="${escapeHTML(item.title||"")}"></label><label class="span-2">Task description<textarea name="description" maxlength="1500">${escapeHTML(item.description||"")}</textarea></label><label>Project *<select name="projectId" required><option value="">Select project</option>${optionList(workspace.projects,projectId)}</select></label><label>Staff member *<select name="staffId" required><option value="">Select staff member</option>${optionList(workspace.staff,staffId)}</select></label><label>Reporting month *<input name="reportingMonth" type="month" required value="${item.reportingMonth||workspace.selectedReportingMonth}"></label><label>Status *<select name="status">${TASK_STATUSES.map(s=>`<option ${item.status===s?"selected":""}>${s}</option>`).join("")}</select></label>`;
  } else if(type==="report"){
    const item=id?workspace.reports.find(r=>r.id===id):{}; title=id?"Edit monthly report":"New monthly report"; submit=id?"Save report":"Create draft";
    const projectId=item.projectId||extra.projectId||"",staffId=item.staffId||extra.staffId||"";
    body=`<label>Project *<select name="projectId" required ${id?"disabled":""}><option value="">Select project</option>${optionList(workspace.projects,projectId)}</select></label><label>Staff member *<select name="staffId" required ${id?"disabled":""}><option value="">Select staff member</option>${optionList(workspace.staff,staffId)}</select></label><label>Reporting month *<input name="reportingMonth" type="month" required value="${item.reportingMonth||workspace.selectedReportingMonth}" ${id?"disabled":""}></label><label>Review status<input value="${escapeHTML(item.reviewStatus||"Draft")}" disabled></label><label class="span-2">Activities completed<textarea name="activitiesCompleted" maxlength="4000">${escapeHTML(item.activitiesCompleted||"")}</textarea></label><label class="span-2">Outcomes<textarea name="outcomes" maxlength="4000">${escapeHTML(item.outcomes||"")}</textarea></label><label class="span-2">Challenges<textarea name="challenges" maxlength="4000">${escapeHTML(item.challenges||"")}</textarea></label><label class="span-2">Next steps<textarea name="nextSteps" maxlength="4000">${escapeHTML(item.nextSteps||"")}</textarea></label><label class="span-2">Additional notes<textarea name="additionalNotes" maxlength="4000">${escapeHTML(item.additionalNotes||"")}</textarea></label><label class="span-2">Supervisor comments<textarea name="supervisorComments" maxlength="4000">${escapeHTML(item.supervisorComments||"")}</textarea></label>`;
  } else if(type==="review"){
    const item=workspace.reports.find(r=>r.id===id); title=extra.status; eyebrow="Supervisor review"; submit=extra.status==="Needs Changes"?"Return report":"Confirm"; dialogContext.status=extra.status;
    body=`<div class="span-2"><p class="muted">${extra.status==="Needs Changes"?"Explain what must be revised before this report can be resubmitted.":`Change this report to ${extra.status}.`}</p></div><label class="span-2">Supervisor comments ${extra.status==="Needs Changes"?"*":""}<textarea name="supervisorComments" ${extra.status==="Needs Changes"?"required":""} maxlength="4000">${escapeHTML(item.supervisorComments||"")}</textarea></label>`;
  }
  $("#dialog-eyebrow").textContent=eyebrow; $("#dialog-title").textContent=title; $("#dialog-body").innerHTML=body; $("#dialog-submit").textContent=submit;
  setFormBaseline($("#entity-form"));
  dialog.showModal();
  setTimeout(()=>$("input, select, textarea",$("#dialog-body"))?.focus(),40);
}

function formDataObject(form){return Object.fromEntries(new FormData(form).entries());}

function saveEntity(event){
  event.preventDefault();
  const data=formDataObject(event.currentTarget), stamp=now(), {type,id}=dialogContext;
  if(type==="project"){
    if(data.endDate<data.startDate){toast("End date cannot be before the start date.","error");return;}
    if(id) Object.assign(projectFor(id),data,{updatedAt:stamp}); else workspace.projects.push({id:uid("project"),...data,isArchived:false,archivedAt:null,createdAt:stamp,updatedAt:stamp});
  } else if(type==="staff"){
    if(id) Object.assign(staffFor(id),data,{updatedAt:stamp}); else workspace.staff.push({id:uid("staff"),...data,isArchived:false,archivedAt:null,createdAt:stamp,updatedAt:stamp});
  } else if(type==="task"){
    warnOutsideProject(data.projectId,data.reportingMonth);
    if(id) Object.assign(workspace.tasks.find(t=>t.id===id),data,{updatedAt:stamp}); else workspace.tasks.push({id:uid("task"),...data,createdAt:stamp,updatedAt:stamp});
  } else if(type==="report"){
    const existing=id?workspace.reports.find(r=>r.id===id):null;
    const projectId=existing?.projectId||data.projectId,staffId=existing?.staffId||data.staffId,reportingMonth=existing?.reportingMonth||data.reportingMonth;
    if(!id&&workspace.reports.some(r=>r.projectId===projectId&&r.staffId===staffId&&r.reportingMonth===reportingMonth)){toast("A report already exists for this project, staff member and month.","error");return;}
    warnOutsideProject(projectId,reportingMonth);
    if(existing) Object.assign(existing,data,{projectId,staffId,reportingMonth,updatedAt:stamp}); else workspace.reports.push({id:uid("report"),...data,projectId,staffId,reportingMonth,reviewStatus:"Draft",submittedAt:null,reviewedAt:null,createdAt:stamp,updatedAt:stamp});
  } else if(type==="review"){
    const report=workspace.reports.find(r=>r.id===id), status=dialogContext.status;
    if(status==="Needs Changes"&&!data.supervisorComments.trim()){toast("Supervisor comments are required when requesting changes.","error");return;}
    report.reviewStatus=status; report.supervisorComments=data.supervisorComments; report.updatedAt=stamp;
    if(status==="Submitted")report.submittedAt=stamp;
    if(["Approved","Needs Changes"].includes(status))report.reviewedAt=stamp;
  }
  saveWorkspace(); dirtyForms.delete("entity-form"); $("#entity-dialog").close(); toast(`${type==="review"?"Review":"Record"} saved.`);
  if(type==="report"&& !id){const last=workspace.reports.at(-1);navigate("reportDetail",{id:last.id});} else render();
}

function warnOutsideProject(projectId,reportingMonth){
  const p=projectFor(projectId); if(!p)return;
  const start=p.startDate.slice(0,7),end=p.endDate.slice(0,7);
  if(reportingMonth<start||reportingMonth>end)toast("Note: the reporting month falls outside the project funding period.","error");
}

function toggleArchive(kind,id){
  const item=kind==="project"?projectFor(id):staffFor(id); if(!item)return;
  const label=kind==="project"?"project":"staff member";
  if(!confirm(`${item.isArchived?"Restore":"Archive"} this ${label}? Historical records will be preserved.`))return;
  item.isArchived=!item.isArchived; item.archivedAt=item.isArchived?now():null; item.updatedAt=now(); saveWorkspace(); toast(`${label[0].toUpperCase()+label.slice(1)} ${item.isArchived?"archived":"restored"}.`); render();
}

function safeDelete(kind,id){
  const item=kind==="project"?projectFor(id):staffFor(id); if(!item)return;
  const key=kind==="project"?"projectId":"staffId";
  const refs=workspace.tasks.some(t=>t[key]===id)||workspace.reports.some(r=>r[key]===id);
  if(refs){toast(`This ${kind==="project"?"project":"staff member"} has historical records and cannot be deleted. Archive it instead.`,"error");return;}
  if(!confirm(`Permanently delete ${item.name}? This cannot be undone.`))return;
  const collection=kind==="project"?workspace.projects:workspace.staff; collection.splice(collection.findIndex(i=>i.id===id),1); saveWorkspace(); toast("Record deleted."); render();
}

function changeReportStatus(id,status){
  const report=workspace.reports.find(r=>r.id===id); if(!report)return;
  const allowed={Draft:["Submitted"],Submitted:["Approved","Needs Changes"],"Needs Changes":["Submitted"],Approved:["Draft"]};
  if(!allowed[report.reviewStatus]?.includes(status)){toast("That review status change is not allowed.","error");return;}
  if(report.reviewStatus==="Draft"&&status==="Submitted"&&!([report.activitiesCompleted,report.outcomes,report.challenges,report.nextSteps,report.additionalNotes].some(value=>String(value||"").trim()))){
    toast("Add meaningful report content before submitting. Complete at least one report field.","error");
    return;
  }
  if(status==="Draft"){
    if(!confirm("Reopen this approved report as Draft? It will become editable and require submission again."))return;
    Object.assign(report,{reviewStatus:"Draft",reviewedAt:null,updatedAt:now()}); saveWorkspace(); toast("Report reopened as Draft."); render(); return;
  }
  openEntityDialog("review",id,{status});
}

function exportBackup(){
  const payload={...workspace,schemaVersion:SCHEMA_VERSION,exportedAt:now()};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`report-manager-backup-${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(url); toast("Workspace backup exported. PIN settings were excluded.");
}

function validateBackup(data){
  if(!data||typeof data!=="object")throw new Error("The file does not contain a workspace object.");
  if(!Number.isInteger(Number(data.schemaVersion)))throw new Error("Missing schema version.");
  if(Number(data.schemaVersion)>SCHEMA_VERSION)throw new Error("This backup was created by a newer version of Report Manager.");
  for(const key of ["projects","staff","tasks","reports"])if(!Array.isArray(data[key]))throw new Error(`Invalid or missing ${key} collection.`);
  const projectIds=new Set(data.projects.map(p=>p.id)),staffIds=new Set(data.staff.map(s=>s.id));
  if([...data.tasks,...data.reports].some(item=>!item.id||!projectIds.has(item.projectId)||!staffIds.has(item.staffId)))throw new Error("The backup contains missing or invalid record relationships.");
  if(data.projects.some(p=>!p.id||!p.name)||data.staff.some(s=>!s.id||!s.name)||data.tasks.some(t=>!t.title||!TASK_STATUSES.includes(t.status))||data.reports.some(r=>!REPORT_STATUSES.includes(r.reviewStatus)))throw new Error("The backup contains invalid required fields or statuses.");
  return migrateWorkspace(structuredClone(data));
}

async function restoreBackup(file){
  try{
    const parsed=JSON.parse(await file.text()); const candidate=validateBackup(parsed);
    if(!confirm("Restore this backup? All current workspace data will be overwritten. Your local PIN settings will remain unchanged.")){toast("Restore cancelled.");return;}
    workspace=candidate; saveWorkspace();
    if(workspaceLoadError) activateRecoveredWorkspace(); else { updateChrome(); navigate("dashboard",{}, {skipUnsavedCheck:true}); }
    toast("Workspace restored successfully.");
  }catch(error){toast(`Restore failed: ${error.message}`,"error");}
  $("#restore-input").value="";
}

function bytesToHex(bytes){return [...bytes].map(b=>b.toString(16).padStart(2,"0")).join("");}
function randomSalt(){const bytes=crypto.getRandomValues(new Uint8Array(16));return bytesToHex(bytes);}
async function hashPin(pin,salt){
  const material=await crypto.subtle.importKey("raw",new TextEncoder().encode(pin),"PBKDF2",false,["deriveBits"]);
  const bits=await crypto.subtle.deriveBits({name:"PBKDF2",salt:new TextEncoder().encode(salt),iterations:120000,hash:"SHA-256"},material,256);
  return bytesToHex(new Uint8Array(bits));
}

async function setPrivacyFromForm(form){
  const data=formDataObject(form),pin=data.pin.trim(),confirmPin=data.confirmPin.trim();
  if(pin||!privacy.pinHash){
    if(!/^\d{4,12}$/.test(pin)){toast("PIN must contain 4–12 digits.","error");return false;}
    if(pin!==confirmPin){toast("PIN confirmation does not match.","error");return false;}
    privacy.pinSalt=randomSalt(); privacy.pinHash=await hashPin(pin,privacy.pinSalt);
  }
  privacy.autoLockMinutes=Number(data.autoLock); savePrivacy(); toast("Privacy settings saved."); render(); return true;
}

function lockWorkspace(){
  if(!privacy.pinHash){toast("Create a PIN in Settings before locking the workspace.","error");return;}
  isLocked=true; clearTimeout(inactivityTimer); $("#app").classList.add("hidden"); $("#lock-screen").classList.remove("hidden"); $("#lock-workspace-name").textContent=workspace.workspaceName||"Local workspace"; $("#unlock-pin").value=""; $("#unlock-error").textContent=""; setTimeout(()=>$("#unlock-pin").focus(),30);
}

async function unlockWorkspace(event){
  event.preventDefault(); const pin=$("#unlock-pin").value; const hash=await hashPin(pin,privacy.pinSalt);
  if(hash!==privacy.pinHash){$("#unlock-error").textContent="Incorrect PIN. Please try again."; $("#unlock-pin").select();return;}
  isLocked=false; $("#lock-screen").classList.add("hidden"); $("#app").classList.remove("hidden"); resetInactivityTimer(); toast("Workspace unlocked.");
}

function resetInactivityTimer(){
  clearTimeout(inactivityTimer); if(isLocked||!privacy.pinHash||!privacy.autoLockMinutes)return;
  inactivityTimer=setTimeout(lockWorkspace,Number(privacy.autoLockMinutes)*60*1000);
}

function handleMainClick(event){
  const t=event.target.closest("button"); if(!t)return;
  if(t.dataset.dashboardNav){navigate(t.dataset.dashboardNav,t.dataset.dashboardStatus?{status:t.dataset.dashboardStatus}:{});return;}
  if(t.dataset.nav)navigate(t.dataset.nav);
  if(t.dataset.new)openEntityDialog(t.dataset.new);
  if(t.dataset.projectOpen)navigate("projectDetail",{id:t.dataset.projectOpen});
  if(t.dataset.staffOpen)navigate("staffDetail",{id:t.dataset.staffOpen});
  if(t.dataset.reportOpen)navigate("reportDetail",{id:t.dataset.reportOpen});
  if(t.dataset.projectEdit)openEntityDialog("project",t.dataset.projectEdit);
  if(t.dataset.staffEdit)openEntityDialog("staff",t.dataset.staffEdit);
  if(t.dataset.taskEdit)openEntityDialog("task",t.dataset.taskEdit);
  if(t.dataset.reportEdit)openEntityDialog("report",t.dataset.reportEdit);
  if(t.dataset.projectArchive)toggleArchive("project",t.dataset.projectArchive);
  if(t.dataset.staffArchive)toggleArchive("staff",t.dataset.staffArchive);
  if(t.dataset.projectDelete)safeDelete("project",t.dataset.projectDelete);
  if(t.dataset.staffDelete)safeDelete("staff",t.dataset.staffDelete);
  if(t.dataset.taskDelete){if(confirm("Delete this task permanently?")){workspace.tasks=workspace.tasks.filter(x=>x.id!==t.dataset.taskDelete);saveWorkspace();toast("Task deleted.");render();}}
  if(t.dataset.projectArchiveFilter!==undefined)navigate("projects",{archived:!viewState.archived});
  if(t.dataset.staffArchiveFilter!==undefined)navigate("staff",{archived:!viewState.archived});
  if(t.dataset.filterTasksProject)navigate("tasks",{project:t.dataset.filterTasksProject});
  if(t.dataset.filterReportsProject)navigate("reports",{project:t.dataset.filterReportsProject});
  if(t.dataset.reportTransition)changeReportStatus(t.dataset.id,t.dataset.reportTransition);
  if(t.dataset.reportReopen)changeReportStatus(t.dataset.reportReopen,"Draft");
  if(t.id==="export-backup")exportBackup();
  if(t.id==="choose-restore")$("#restore-input").click();
  if(t.id==="settings-lock")lockWorkspace();
  if(t.id==="reset-sample"&&confirm("Replace the entire workspace with the original sample data? This cannot be undone unless you export a backup first.")){workspace=makeSampleWorkspace();saveWorkspace();updateChrome();navigate("dashboard");toast("Sample workspace restored.");}
  if(t.id==="remove-pin")removePin();
}

function handleMainChange(event){
  const t=event.target;
  if(t.dataset.taskStatus){const task=workspace.tasks.find(x=>x.id===t.dataset.taskStatus);task.status=t.value;task.updatedAt=now();saveWorkspace();toast("Task status updated.");render();}
  const filters={"task-project-filter":"project","task-staff-filter":"staff","task-status-filter":"status","report-project-filter":"project","report-staff-filter":"staff","report-status-filter":"status"};
  if(filters[t.id]){viewState[filters[t.id]]=t.value;render();}
}

async function removePin(){
  const entered=prompt("Enter the current PIN to remove the privacy lock:"); if(entered===null)return;
  if(await hashPin(entered,privacy.pinSalt)!==privacy.pinHash){toast("Incorrect PIN. Privacy lock was not removed.","error");return;}
  privacy={pinHash:"",pinSalt:"",autoLockMinutes:0,privacySettingsVersion:1};savePrivacy();toast("Privacy lock removed from this device.");render();
}

document.addEventListener("DOMContentLoaded",()=>{
  if(workspace){saveWorkspace(); updateChrome(); render();} else showWorkspaceLoadError();
  $("#main-nav").addEventListener("click",e=>{const btn=e.target.closest("[data-view]");if(btn)navigate(btn.dataset.view);});
  $("#main-content").addEventListener("click",handleMainClick);
  $("#main-content").addEventListener("change",handleMainChange);
  $("#main-content").addEventListener("input",e=>{markFormDirty(e.target.closest("form"));if(e.target.id==="project-search"){viewState.search=e.target.value;render();$("#project-search").focus();}if(e.target.id==="staff-search"){viewState.search=e.target.value;render();$("#staff-search").focus();}});
  $("#main-content").addEventListener("submit",async e=>{e.preventDefault();if(e.target.id==="workspace-settings"){workspace.workspaceName=formDataObject(e.target).workspaceName.trim();saveWorkspace();dirtyForms.delete("workspace-settings");updateChrome();toast("Workspace name saved.");render();}if(e.target.id==="privacy-settings"&&await setPrivacyFromForm(e.target))dirtyForms.delete("privacy-settings");});
  $("#global-month").addEventListener("change",e=>{if(!confirmDiscardChanges()){e.target.value=workspace.selectedReportingMonth;return;}workspace.selectedReportingMonth=e.target.value||currentMonth();saveWorkspace();render();});
  $("#quick-action").addEventListener("click",e=>openEntityDialog(e.currentTarget.dataset.entity));
  $("#entity-form").addEventListener("submit",saveEntity);
  $("#entity-form").addEventListener("input",e=>markFormDirty(e.currentTarget));
  $("#entity-form").addEventListener("change",e=>markFormDirty(e.currentTarget));
  const closeEntityDialog=()=>{if(confirmDiscardChanges())$("#entity-dialog").close();};
  $$('[data-close-dialog]').forEach(btn=>btn.addEventListener("click",closeEntityDialog));
  $("#entity-dialog").addEventListener("click",e=>{if(e.target===$("#entity-dialog"))closeEntityDialog();});
  $("#entity-dialog").addEventListener("cancel",e=>{e.preventDefault();closeEntityDialog();});
  $("#menu-toggle").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
  $("#lock-sidebar").addEventListener("click",lockWorkspace); $("#lock-top").addEventListener("click",lockWorkspace);
  $("#unlock-form").addEventListener("submit",unlockWorkspace);
  $("#restore-input").addEventListener("change",e=>{if(e.target.files[0])restoreBackup(e.target.files[0]);});
  $("#error-restore").addEventListener("click",()=>$("#restore-input").click());
  $("#error-reset").addEventListener("click",()=>{if(!confirm("Reset the unreadable workspace and replace it with sample data? This cannot be undone unless you have a backup."))return;try{workspace=makeSampleWorkspace();saveWorkspace();activateRecoveredWorkspace();toast("Workspace reset to sample data.");}catch(error){workspace=null;toast(`Reset failed: ${error.message||"Workspace storage is unavailable."}`,"error");}});
  window.addEventListener("beforeunload",e=>{if(!hasUnsavedChanges())return;e.preventDefault();e.returnValue="";});
  for(const event of ["pointerdown","keydown","touchstart"])document.addEventListener(event,resetInactivityTimer,{passive:true});
  if(workspace){if(isLocked)lockWorkspace(); else resetInactivityTimer();}
});
