import prisma from "../config/prismaClient.js";

export const getPaymentsAnalytics = async () => {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id:                true,
      createdAt:         true,
      fullName:          true,
      schoolName:        true,
      email:             true,
      phone:             true,
      address:           true,
      planId:            true,
      planName:          true,
      planPrice:         true,
      maxSchools:        true,
      maxStudents:       true,
      maxTeachers:       true,
      maxSchoolAdmins:   true,
      planStartDate:     true,
      planEndDate:       true,
      userCount:         true,
      studentCount:      true,
      teacherCount:      true,
      amount:            true,
      razorpayOrderId:   true,
      razorpayPaymentId: true,
      status:            true,
      superAdminId:      true,
      universityId:      true,
      schoolId:          true,
      university: {
        select: { id: true, name: true },
      },
      School: {                          // ← capital S
        select: {
          id:   true,
          name: true,
          type: true,
          university: {
            select: { id: true, name: true },
          },
        },
      },
      subscriptions: {                   // ← lowercase
        select: {
          id:     true,
          status: true,
          plan: {
            select: {
              id:              true,
              name:            true,
              price:           true,
              maxSchools:      true,
              maxStudents:     true,
              maxTeachers:     true,
              maxSchoolAdmins: true,
              features:        true,
              isActive:        true,
            },
          },
        },
      },
    },
  });

  // SUCCESSFUL PAYMENTS
  const successfulPayments = payments.filter((p) => p.status === "SUCCESS");

  // TOTAL REVENUE
  const totalRevenue = successfulPayments.reduce(
    (acc, item) => acc + Number(item.amount), 0
  );

  // MONTHLY REVENUE
  const currentMonth = new Date().getMonth();
  const currentYear  = new Date().getFullYear();

  const monthlyRevenue = successfulPayments
    .filter((p) => {
      const d = new Date(p.createdAt);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, item) => acc + Number(item.amount || 0), 0);

  // UNIVERSITY REVENUE
  const universityRevenueMap = {};

  successfulPayments.forEach((payment) => {
    const universityName =
      payment.university?.name ||
      payment.School?.university?.name ||
      "Unknown University";

    if (!universityRevenueMap[universityName]) {
      universityRevenueMap[universityName] = {
        universityName, totalRevenue: 0, totalPayments: 0, schools: new Set(),
      };
    }

    universityRevenueMap[universityName].totalRevenue  += Number(payment.amount);
    universityRevenueMap[universityName].totalPayments += 1;

    if (payment.School?.name) {
      universityRevenueMap[universityName].schools.add(payment.School.name);
    }
  });

  const universityRevenue = Object.values(universityRevenueMap).map((item) => ({
    universityName: item.universityName,
    totalRevenue:   item.totalRevenue,
    totalPayments:  item.totalPayments,
    totalSchools:   item.schools.size,
  }));

  // PACKAGE ANALYTICS
  const packageAnalyticsMap = {};

  successfulPayments.forEach((payment) => {
    const subs = payment.subscriptions || [];
    const planName = subs[0]?.plan?.name || payment.planName || "Basic Plan";

    if (!packageAnalyticsMap[planName]) {
      packageAnalyticsMap[planName] = { planName, totalRevenue: 0, totalSubscriptions: 0 };
    }

    packageAnalyticsMap[planName].totalRevenue       += Number(payment.amount);
    packageAnalyticsMap[planName].totalSubscriptions += 1;
  });

  const packageAnalytics = Object.values(packageAnalyticsMap);

  // PAYMENT HISTORY
  const paymentHistory = payments.map((payment) => ({
    id:                payment.id,
    universityName:    payment.university?.name || payment.School?.university?.name || "Unknown University",
    schoolName:        payment.School?.name || payment.schoolName || "N/A",
    schoolType:        payment.School?.type || "N/A",
    amount:            payment.amount,
    status:            payment.status,
    razorpayOrderId:   payment.razorpayOrderId,
    razorpayPaymentId: payment.razorpayPaymentId,
    paymentDate:       payment.createdAt,
    packages:          payment.subscriptions?.length > 0
      ? payment.subscriptions.map((s) => s.plan?.name).filter(Boolean)
      : [payment.planName || "Basic Plan"],
  }));

  return {
    summary: {
      totalRevenue,
      monthlyRevenue,
      totalPayments:      payments.length,
      successfulPayments: successfulPayments.length,
      failedPayments:  payments.filter((p) => p.status === "FAILED").length,
      pendingPayments: payments.filter((p) => p.status === "PENDING").length,
    },
    universityRevenue,
    packageAnalytics,
    paymentHistory,
  };
};