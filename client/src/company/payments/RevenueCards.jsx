const RevenueCards = ({ summary }) => {
const cards = [
  {
    title: "Total Revenue",
    value: `₹${Number(
      summary?.totalRevenue || 0
    ).toLocaleString("en-IN")}`,
  },
  {
    title: "Monthly Revenue",
    value: `₹${Number(
      summary?.monthlyRevenue || 0
    ).toLocaleString("en-IN")}`,
  },
  {
    title: "Success Payments",
    value: Number(
      summary?.successfulPayments || 0
    ).toLocaleString("en-IN"),
  },
  {
    title: "Failed Payments",
    value: Number(
      summary?.failedPayments || 0
    ).toLocaleString("en-IN"),
  },
];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100"
        >
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">
            {card.title}
          </p>

          <h2 className="text-3xl font-black text-[#1A1A1A] mt-4">
            {card.value}
          </h2>
        </div>
      ))}
    </div>
  );
};

export default RevenueCards;