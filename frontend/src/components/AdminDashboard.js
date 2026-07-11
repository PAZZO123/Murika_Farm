import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { FaUsers, FaChartLine, FaProjectDiagram, FaBars, FaChartPie, FaBuilding, FaHandshake, FaMoneyBillWave } from 'react-icons/fa';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Logo from '../Assets/Logo.png';

// --- Reusable Chart Component ---
const ChartComponent = ({ type, data }) => {
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500 py-10">No data available for this chart.</div>;
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#E3A000', '#6A0DAD', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'];

  switch (type) {
    case 'bar':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" name="Count" />
          </BarChart>
        </ResponsiveContainer>
      );
    case 'pie':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    default:
      return <div className="text-center text-gray-500">No chart type specified</div>;
  }
};

// --- Dashboard Card Component ---
const DashboardCard = ({ title, value, icon, color }) => (
  <div className={`${color} text-white p-6 rounded-lg shadow-md flex items-center justify-between transition-transform transform hover:scale-105`}>
    <div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-2xl font-bold mt-2">{value.toLocaleString()}</p>
    </div>
    <div className="text-5xl opacity-75">{icon}</div>
  </div>
);

// --- Chart Card Component ---
const ChartCard = ({ title, icon, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
      {icon} {title}
    </h3>
    {children}
  </div>
);

// --- Main Admin Dashboard Component ---
const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalCampaigns: 0,
    totalCompanyProducts: 0,
    totalClientProducts: 0,
    totalExpenses: 0,
    totalProjects: 0,
    userRoles: [],
    campaignStatus: [],
    companyProductCategories: [],
    clientProductStatuses: [],
    clientPaymentStatuses: [],
    expenseCategories: [],
    projectStatus: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dashboardRef = useRef(null);

  const getAuthToken = useCallback(() => localStorage.getItem('token'), []);

  const getHeaders = useCallback(() => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [getAuthToken]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const headers = getHeaders();

        const [
          usersResponse,
          campaignsResponse,
          companyProductsResponse,
          clientProductsResponse,
          expensesResponse,
          projectsResponse,
        ] = await Promise.all([
          axios.get("http://localhost:5000/api/auth/users", { headers }),
          axios.get("http://localhost:5000/api/campaigns", { headers }),
          axios.get("http://localhost:5000/api/products", { headers }),
          axios.get("http://localhost:5000/api/clientproducts", { headers }),
          axios.get("http://localhost:5000/api/expenses", { headers }),
          axios.get("http://localhost:5000/api/projects", { headers }),
        ]);

        const users = Array.isArray(usersResponse.data) ? usersResponse.data : [];
        const campaigns = Array.isArray(campaignsResponse.data) ? campaignsResponse.data : [];
        const companyProducts = Array.isArray(companyProductsResponse.data) ? companyProductsResponse.data : [];
        const clientProducts = Array.isArray(clientProductsResponse.data) ? clientProductsResponse.data : [];
        const expenses = Array.isArray(expensesResponse.data) ? expensesResponse.data : expensesResponse.data.expenses || [];
        const projects = Array.isArray(projectsResponse.data) ? projectsResponse.data : [];

        const aggregateData = (data, key, defaultVal = 'Unknown') =>
          data.reduce((acc, item) => {
            const val = item[key] || defaultVal;
            acc[val] = (acc[val] || 0) + 1;
            return acc;
          }, {});

        const transformToChartData = (aggregatedData) =>
          Object.keys(aggregatedData).map((name) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value: aggregatedData[name],
          }));

        const totalExpenseAmount = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

        setDashboardData({
          totalUsers: users.length,
          totalCampaigns: campaigns.length,
          totalCompanyProducts: companyProducts.length,
          totalClientProducts: clientProducts.length,
          totalExpenses: totalExpenseAmount,
          totalProjects: projects.length,
          userRoles: transformToChartData(aggregateData(users, 'role')),
          campaignStatus: transformToChartData(aggregateData(campaigns, 'status', 'Active')),
          companyProductCategories: transformToChartData(aggregateData(companyProducts, 'category', 'Uncategorized')),
          clientProductStatuses: transformToChartData(aggregateData(clientProducts, 'status')),
          clientPaymentStatuses: transformToChartData(aggregateData(clientProducts, 'paymentStatus')),
          expenseCategories: transformToChartData(aggregateData(expenses, 'category', 'General')),
          projectStatus: transformToChartData(aggregateData(projects, 'status', 'Pending')),
        });
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          alert("Session expired or unauthorized. Please sign in.");
          window.location.href = '/login';
        }
        setError("Failed to load dashboard data. Please try again.");
        console.error("Dashboard data fetch error:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [getHeaders]);

  const handleDownloadReport = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const GREEN  = [26, 107, 58];
    const GREEN2 = [45, 158, 87];
    const WHITE  = [255, 255, 255];
    const GREY   = [74, 74, 74];
    const LIGHT  = [232, 245, 238];

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const fullName = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'Staff Member';
    const role = currentUser.role
      ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)
      : 'Internal Staff';
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    const fileName = `Murika_Report_${new Date().toISOString().slice(0,10)}.pdf`;

    // ── helper: draw page chrome (header bar + footer bar + page number) ──
    const drawChrome = (pageNum, totalPages) => {
      // top green bar
      doc.setFillColor(...GREEN);
      doc.rect(0, 0, pageW, 14, 'F');
      // bottom green bar
      doc.setFillColor(...GREEN);
      doc.rect(0, pageH - 10, pageW, 10, 'F');
      // footer text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...WHITE);
      doc.text('Murika Farms — Confidential Business Report', 14, pageH - 3.5);
      doc.text(`Page ${pageNum} of ${totalPages}`, pageW - 14, pageH - 3.5, { align: 'right' });
    };

    // ── PAGE 1 ────────────────────────────────────────────────────────────

    // --- logo ---
    try {
      await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          doc.addImage(img, 'PNG', pageW / 2 - 12, 16, 24, 24);
          resolve();
        };
        img.onerror = resolve;
        img.src = Logo;
      });
    } catch (_) {}

    // --- title ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(...GREEN);
    doc.text('MURIKA FARMS', pageW / 2, 46, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GREY);
    doc.text('Business Management System — Dashboard Report', pageW / 2, 53, { align: 'center' });

    // green divider
    doc.setDrawColor(...GREEN2);
    doc.setLineWidth(0.8);
    doc.line(14, 57, pageW - 14, 57);

    // --- meta info table ---
    doc.autoTable({
      startY: 60,
      margin: { left: 14, right: 14 },
      theme: 'plain',
      styles: { fontSize: 8.5, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: GREEN, cellWidth: 38 },
        1: { textColor: GREY, cellWidth: 58 },
        2: { fontStyle: 'bold', textColor: GREEN, cellWidth: 38 },
        3: { textColor: GREY, cellWidth: 44 },
      },
      body: [
        ['Report Date:', today,         'Prepared By:', fullName],
        ['Position:',   role,           'Report Type:', 'Dashboard Summary'],
        ['System:',     'Murika Farms', 'Status:',      'Generated'],
      ],
      didParseCell: (data) => {
        data.cell.styles.fillColor = data.row.index % 2 === 0 ? LIGHT : WHITE;
        data.cell.styles.lineColor = [197, 224, 207];
        data.cell.styles.lineWidth = 0.2;
      },
    });

    // --- Section 1: Key Metrics ---
    let y = doc.lastAutoTable.finalY + 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...GREEN);
    doc.text('1.  Key Performance Metrics', 14, y);
    doc.setDrawColor(...GREEN2);
    doc.setLineWidth(0.5);
    doc.line(14, y + 2, pageW - 14, y + 2);

    doc.autoTable({
      startY: y + 5,
      margin: { left: 14, right: 14 },
      head: [['Metric', 'Value']],
      body: [
        ['Total Users',         dashboardData.totalUsers.toString()],
        ['Total Campaigns',     dashboardData.totalCampaigns.toString()],
        ['Company Products',    dashboardData.totalCompanyProducts.toString()],
        ['Supplier Products',   dashboardData.totalClientProducts.toString()],
        ['Total Projects',      dashboardData.totalProjects.toString()],
        ['Total Expenses',      `${dashboardData.totalExpenses.toLocaleString()} RWF`],
      ],
      headStyles: { fillColor: GREEN, textColor: WHITE, fontStyle: 'bold', fontSize: 9 },
      alternateRowStyles: { fillColor: LIGHT },
      styles: { fontSize: 9, cellPadding: 4, textColor: GREY },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: GREEN },
        1: { halign: 'right' },
      },
      tableLineColor: GREEN2,
      tableLineWidth: 0.3,
    });

    // --- Section 2: User Roles ---
    y = doc.lastAutoTable.finalY + 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...GREEN);
    doc.text('2.  User Roles Distribution', 14, y);
    doc.setDrawColor(...GREEN2);
    doc.line(14, y + 2, pageW - 14, y + 2);

    doc.autoTable({
      startY: y + 5,
      margin: { left: 14, right: 14 },
      head: [['Role', 'Count']],
      body: dashboardData.userRoles.length > 0
        ? dashboardData.userRoles.map(r => [r.name, r.value.toString()])
        : [['No data', '—']],
      headStyles: { fillColor: GREEN, textColor: WHITE, fontStyle: 'bold', fontSize: 9 },
      alternateRowStyles: { fillColor: LIGHT },
      styles: { fontSize: 9, cellPadding: 4, textColor: GREY },
      columnStyles: { 1: { halign: 'right' } },
      tableLineColor: GREEN2,
      tableLineWidth: 0.3,
    });

    // --- Section 3: Campaign Status ---
    y = doc.lastAutoTable.finalY + 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...GREEN);
    doc.text('3.  Campaign Status', 14, y);
    doc.setDrawColor(...GREEN2);
    doc.line(14, y + 2, pageW - 14, y + 2);

    doc.autoTable({
      startY: y + 5,
      margin: { left: 14, right: 14 },
      head: [['Status', 'Count']],
      body: dashboardData.campaignStatus.length > 0
        ? dashboardData.campaignStatus.map(r => [r.name, r.value.toString()])
        : [['No data', '—']],
      headStyles: { fillColor: GREEN, textColor: WHITE, fontStyle: 'bold', fontSize: 9 },
      alternateRowStyles: { fillColor: LIGHT },
      styles: { fontSize: 9, cellPadding: 4, textColor: GREY },
      columnStyles: { 1: { halign: 'right' } },
      tableLineColor: GREEN2,
      tableLineWidth: 0.3,
    });

    // --- Section 4: Supplier Products ---
    y = doc.lastAutoTable.finalY + 8;
    // new page if needed
    if (y > pageH - 80) { doc.addPage(); y = 20; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...GREEN);
    doc.text('4.  Supplier Product Status', 14, y);
    doc.setDrawColor(...GREEN2);
    doc.line(14, y + 2, pageW - 14, y + 2);

    doc.autoTable({
      startY: y + 5,
      margin: { left: 14, right: 14 },
      head: [['Status', 'Count']],
      body: dashboardData.clientProductStatuses.length > 0
        ? dashboardData.clientProductStatuses.map(r => [r.name, r.value.toString()])
        : [['No data', '—']],
      headStyles: { fillColor: GREEN, textColor: WHITE, fontStyle: 'bold', fontSize: 9 },
      alternateRowStyles: { fillColor: LIGHT },
      styles: { fontSize: 9, cellPadding: 4, textColor: GREY },
      columnStyles: { 1: { halign: 'right' } },
      tableLineColor: GREEN2,
      tableLineWidth: 0.3,
    });

    // --- Section 5: Payment Status ---
    y = doc.lastAutoTable.finalY + 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...GREEN);
    doc.text('5.  Supplier Payment Status', 14, y);
    doc.setDrawColor(...GREEN2);
    doc.line(14, y + 2, pageW - 14, y + 2);

    doc.autoTable({
      startY: y + 5,
      margin: { left: 14, right: 14 },
      head: [['Payment Status', 'Count']],
      body: dashboardData.clientPaymentStatuses.length > 0
        ? dashboardData.clientPaymentStatuses.map(r => [r.name, r.value.toString()])
        : [['No data', '—']],
      headStyles: { fillColor: GREEN, textColor: WHITE, fontStyle: 'bold', fontSize: 9 },
      alternateRowStyles: { fillColor: LIGHT },
      styles: { fontSize: 9, cellPadding: 4, textColor: GREY },
      columnStyles: { 1: { halign: 'right' } },
      tableLineColor: GREEN2,
      tableLineWidth: 0.3,
    });

    // --- Section 6: Project Status ---
    y = doc.lastAutoTable.finalY + 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...GREEN);
    doc.text('6.  Project Status', 14, y);
    doc.setDrawColor(...GREEN2);
    doc.line(14, y + 2, pageW - 14, y + 2);

    doc.autoTable({
      startY: y + 5,
      margin: { left: 14, right: 14 },
      head: [['Status', 'Count']],
      body: dashboardData.projectStatus.length > 0
        ? dashboardData.projectStatus.map(r => [r.name, r.value.toString()])
        : [['No data', '—']],
      headStyles: { fillColor: GREEN, textColor: WHITE, fontStyle: 'bold', fontSize: 9 },
      alternateRowStyles: { fillColor: LIGHT },
      styles: { fontSize: 9, cellPadding: 4, textColor: GREY },
      columnStyles: { 1: { halign: 'right' } },
      tableLineColor: GREEN2,
      tableLineWidth: 0.3,
    });

    // --- Section 7: Expense Categories ---
    y = doc.lastAutoTable.finalY + 8;
    if (y > pageH - 80) { doc.addPage(); y = 20; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...GREEN);
    doc.text('7.  Expense Categories', 14, y);
    doc.setDrawColor(...GREEN2);
    doc.line(14, y + 2, pageW - 14, y + 2);

    doc.autoTable({
      startY: y + 5,
      margin: { left: 14, right: 14 },
      head: [['Category', 'Count']],
      body: dashboardData.expenseCategories.length > 0
        ? dashboardData.expenseCategories.map(r => [r.name, r.value.toString()])
        : [['No data', '—']],
      headStyles: { fillColor: GREEN, textColor: WHITE, fontStyle: 'bold', fontSize: 9 },
      alternateRowStyles: { fillColor: LIGHT },
      styles: { fontSize: 9, cellPadding: 4, textColor: GREY },
      columnStyles: { 1: { halign: 'right' } },
      tableLineColor: GREEN2,
      tableLineWidth: 0.3,
    });

    // ── SIGNATURE BLOCK ───────────────────────────────────────────────────
    y = doc.lastAutoTable.finalY + 12;
    if (y > pageH - 55) { doc.addPage(); y = 20; }

    doc.setDrawColor(...GREEN2);
    doc.setLineWidth(0.8);
    doc.line(14, y, pageW - 14, y);
    y += 8;

    // Left — Prepared By
    const leftX  = 30;
    const rightX = pageW - 30;
    const sigLineW = 55;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...GREEN);
    doc.text('PREPARED BY', leftX, y, { align: 'center' });
    doc.text('APPROVED BY', rightX, y, { align: 'center' });

    y += 16;
    // signature lines
    doc.setDrawColor(...GREEN);
    doc.setLineWidth(0.5);
    doc.line(leftX  - sigLineW / 2, y, leftX  + sigLineW / 2, y);
    doc.line(rightX - sigLineW / 2, y, rightX + sigLineW / 2, y);

    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...GREEN);
    doc.text(fullName, leftX, y, { align: 'center' });
    doc.text('..............................', rightX, y, { align: 'center' });

    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...GREY);
    doc.text(role, leftX, y, { align: 'center' });
    doc.text('Project Manager / Supervisor', rightX, y, { align: 'center' });

    y += 5;
    doc.setFontSize(8);
    doc.text(`Date: ${today}`, leftX, y, { align: 'center' });
    doc.text(`Date: ${today}`, rightX, y, { align: 'center' });

    // ── apply chrome to all pages ──────────────────────────────────────────
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      drawChrome(i, totalPages);
    }

    doc.save(fileName);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-lg font-semibold text-gray-700">Loading Dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-red-100 text-red-700">
        <div className="text-lg font-semibold">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard Overview</h1>
        <button
          onClick={handleDownloadReport}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
          </svg>
          Download PDF Report
        </button>
      </div>

      <div ref={dashboardRef}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-8">
          <DashboardCard title="Total Users" value={dashboardData.totalUsers} icon={<FaUsers />} color="bg-gradient-to-r from-blue-500 to-blue-600" />
          <DashboardCard title="Total Campaigns" value={dashboardData.totalCampaigns} icon={<FaChartLine />} color="bg-gradient-to-r from-green-500 to-green-600" />
          <DashboardCard title="Your Products" value={dashboardData.totalCompanyProducts} icon={<FaBuilding />} color="bg-gradient-to-r from-orange-500 to-orange-600" />
          <DashboardCard title="Supplier Products" value={dashboardData.totalClientProducts} icon={<FaHandshake />} color="bg-gradient-to-r from-purple-500 to-purple-600" />
          <DashboardCard title="Total Projects" value={dashboardData.totalProjects} icon={<FaProjectDiagram />} color="bg-gradient-to-r from-yellow-500 to-yellow-600" />
          <DashboardCard title="Total Expenses" value={`${dashboardData.totalExpenses} Rwf`} icon={<FaMoneyBillWave />} color="bg-gradient-to-r from-red-500 to-red-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="User Roles Distribution" icon={<FaChartPie />}>
            <ChartComponent type="pie" data={dashboardData.userRoles} />
          </ChartCard>

          <ChartCard title="Campaign Status" icon={<FaBars />}>
            <ChartComponent type="bar" data={dashboardData.campaignStatus} />
          </ChartCard>

          <ChartCard title="Supplier Product Status" icon={<FaBars />}>
            <ChartComponent type="bar" data={dashboardData.clientProductStatuses} />
          </ChartCard>

          <ChartCard title="Supplier Payment Status" icon={<FaChartPie />}>
            <ChartComponent type="pie" data={dashboardData.clientPaymentStatuses} />
          </ChartCard>

          <ChartCard title="Project Status" icon={<FaChartPie />}>
            <ChartComponent type="pie" data={dashboardData.projectStatus} />
          </ChartCard>

          <ChartCard title="Expense Categories" icon={<FaChartPie />}>
            <ChartComponent type="pie" data={dashboardData.expenseCategories} />
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;