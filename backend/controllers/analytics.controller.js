import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

export const analytic = async (req, res) => {
  try {
    const analyticsData = await getAnalyticsData();

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    const dailySalesData = await getDailySalesDate(startDate, endDate);

    res.json({
      analyticsData,
      dailySalesData,
    });
  } catch (error) {
    console.log("Error in analytics route: " + error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//trả về dữ liệu phân tích tổng quan của ứng dụng
export const getAnalyticsData = async (req, res) => {
  //Lấy ra tổng số user
  const totalUsers = await User.countDocuments();
  //Lấy ra tổng số sản phẩm
  const totalProducts = await Product.countDocuments();

  const salesData = await Order.aggregate([
    {
      //gộp dữ liệu
      $group: {
        _id: null, //it groups all documents together
        totalSales: { $sum: 1 },
        totalRevenue: { $sum: "totalAmount" },
      },
    },
  ]);

  const { totalSales, totalRevenue } = salesData[0] || {
    totalSales: 0,
    totalRevenue: 0,
  };

  return {
    users: totalUsers,
    products: totalProducts,
    totalSales,
    totalRevenue,
  };
};

//trả về dữ liệu doanh thu hàng ngày trong 1 tuần
export const getDailySalesData = async (startDate, endDate) => {
  //example data:
  /**
   * [
   *  {
   *      _id: "2024-12-10",
   *      sale: 12,
   *      revenue: 140
   *  },
   * {
   *      _id: "2024-12-11",
   *      sale: 12,
   *      revenue: 150
   *  },
   * {
   *      _id: "2024-12-12",
   *      sale: 12,
   *      revenue: 100
   *  },
   * ]
   */

  try {
    const dailySalesData = await Order.aggregate([
      {
        //Lọc các data trong Order dựa trên khoảng thời gian
        $match: {
          createAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        //Nhóm các tài liệu thành nhóm dựa trên ngày tạo
        //Tính tổng doanh thu và số lượng bán hàng
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createAt" } },
          sales: { $sum: 1 },
          revenue: { $sum: "totalAmount" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    //Lấy mảng các khoảng thời gian
    const dateArray = getDatesInRange(startDate, endDate);

    //Tạo một mảng mới chứa dữ liệu về doanh thu hàng ngày cho mỗi ngày trong khoảng thời gian đó
    return dateArray.map((date) => {
      const foundData = dailySalesData.find((item) => item._id === date);

      return {
        date,
        sales: foundData?.sales || 0,
        revenue: foundDate?.revenue || 0,
      };
    });
  } catch (error) {
    //Dừng thực hiện khi có lỗi xảy ra trong qua trình thực hiện và trả về lỗi
    throw error;
  }
};

function getDatesInRange(startDate, endDate) {
  const dates = [];
  let currentDate = newDate(startDate);

  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}
