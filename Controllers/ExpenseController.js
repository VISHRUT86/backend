const UserModel = require ("../Models/User")

// const addExpenses =async(req,res)=>{
//     const body= req.body;
//     const {_id}= req.user;
// try {
//     const userData=await UserModel.findByIdAndUpdate(
//         _id, //user Id
//         {
//             $push:{expenses:req.body}
//         },
//         {
//             new:true
//         } // for returningthe updated documents
//     );
//     return res.status(200).json({
//         message:"Expenses added successfully",
//         success:true,
//         data:userData?.expenses
//     });
    
// } catch (error) {
//     return res.status(500).json({
//         message:"Something went wrong",
//         error:error,
//         success:false
//     })
// }
// }

const addExpenses = async (req, res) => {
    try {
        const {_id} = req.user;
        const newExpense = req.body;
        
        const updatedUser = await UserModel.findByIdAndUpdate(
            _id,
            { $push: { expenses: newExpense } },
            { new: true, select: "expenses" } // Return updated expenses list
        );

        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Expense added successfully",
            success: true,
            data: updatedUser.expenses // ✅ Return full updated expenses
        });

    } catch (error) {
        return res.status(500).json({
            message: "Something went wrong",
            error: error.message,
            success: false
        });
    }
};




///
const fetchExpenses =async(req,res)=>{
    const body= req.body;
    const {_id}= req.user;
    try {
        const userData=await UserModel.findById(_id).select('expenses')
          
           
    
        return res.status(200).json({
            message:"fetched Expenses  successfully",
            success:true,
            data:userData?.expenses
        });
        
    } catch (error) {
        return res.status(500).json({
            message:"Something went wrong",
            error:error,
            success:false
        })
    }
}

const deleteExpenses = async (req, res) => {
    const { _id } = req.user;
    const { expenseId } = req.params;

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            _id,
            { $pull: { expenses: { _id: expenseId } } },
            { new: true, select: "expenses" } // ✅ Return updated list
        );

        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Expense deleted successfully",
            success: true,
            data: updatedUser.expenses // ✅ Return full updated list
        });

    } catch (error) {
        return res.status(500).json({
            message: "Something went wrong",
            error: error.message,
            success: false
        });
    }
};



module.exports = {
    addExpenses,
    fetchExpenses,
    deleteExpenses
}