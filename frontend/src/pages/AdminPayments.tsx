import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { CreditCard, User, Package, Calendar, CheckCircle, XCircle } from 'lucide-react';
import api from '../lib/api';

interface Payment {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  orderId: {
    _id: string;
    totalAmount: number;
    items: Array<{
      product: {
        name: string;
      };
      quantity: number;
    }>;
  };
  razorpayPaymentId: string;
  amount: number;
  status: string;
  createdAt: string;
}

const AdminPayments: React.FC = () => {
  const [page, setPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const { data, isLoading, error } = useQuery(
    ['admin-payments', { page }],
    async () => {
      const response = await api.get(`/admin/payments?page=${page}&limit=10`);
      return response.data;
    }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading payments</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Payment History</h1>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.payments?.map((payment: Payment) => (
              <tr key={payment._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedPayment(payment)}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {payment.razorpayPaymentId.substring(0, 16)}...
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{payment.userId.name}</div>
                      <div className="text-sm text-gray-500">{payment.userId.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Package className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        #{payment.orderId._id.slice(-8)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.orderId.items.length} item{payment.orderId.items.length > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="font-medium">₹{payment.amount.toLocaleString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                    payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {payment.status === 'completed' ? <CheckCircle className="h-3 w-3 mr-1" /> : 
                     payment.status === 'failed' ? <XCircle className="h-3 w-3 mr-1" /> : null}
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data?.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            
            {[...Array(data.totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setPage(index + 1)}
                className={`px-3 py-2 border rounded-lg ${
                  page === index + 1
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {index + 1}
              </button>
            ))}
            
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === data.totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Payment Details</h2>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Payment Information</h3>
                  <p className="text-sm text-gray-600">Payment ID: {selectedPayment.razorpayPaymentId}</p>
                  <p className="text-sm text-gray-600">Amount: ₹{selectedPayment.amount.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Status: {selectedPayment.status}</p>
                  <p className="text-sm text-gray-600">Date: {new Date(selectedPayment.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Customer Information</h3>
                  <p className="text-sm text-gray-600">Name: {selectedPayment.userId.name}</p>
                  <p className="text-sm text-gray-600">Email: {selectedPayment.userId.email}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Order Details</h3>
                <p className="text-sm text-gray-600">Order ID: #{selectedPayment.orderId._id}</p>
                <p className="text-sm text-gray-600">Total Amount: ₹{selectedPayment.orderId.totalAmount.toLocaleString()}</p>
                <div className="mt-2">
                  <h4 className="text-sm font-medium text-gray-900">Items:</h4>
                  <ul className="text-sm text-gray-600 mt-1">
                    {selectedPayment.orderId.items.map((item, index) => (
                      <li key={index}>
                        {item.product.name} (Qty: {item.quantity})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;