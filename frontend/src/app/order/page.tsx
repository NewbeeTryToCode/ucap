'use client';

import { useState, useRef, useEffect } from 'react';

interface OrderItem {
  product_id: number;
  name: string;
  quantity: number;
  unit_price: number;
}

interface OrderConfirmation {
  umkm_id: number;
  transaction_type: string;
  supplier_id: number | null;
  items: OrderItem[];
  total: number;
  transcript: string;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface Modal {
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  isOpen: boolean;
}

export default function OrderPage() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState<OrderConfirmation | null>(null);
  const [error, setError] = useState<string>('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [modal, setModal] = useState<Modal>({
    type: 'info',
    title: '',
    message: '',
    isOpen: false
  });
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Toast functions
  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    const newToast: Toast = { id, type, message };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove toast after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Modal functions
  const showModal = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setModal({
      type,
      title,
      message,
      isOpen: true
    });
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  const startRecording = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processOrder(audioBlob);
        
        // Stop all audio tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError('Failed to access microphone. Please check permissions.');
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const processOrder = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('umkm_id', '1');

     const response = await fetch(`${API_BASE_URL}/transactions/generate-draft`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process order');
      }

      const orderData = await response.json();
      const { transcript,  draft_transaction } = orderData;
      // Validate transcript and items
      if (!transcript || transcript.trim() === '') {
        setError('Could not understand your voice. Please speak clearly and try again.');
        return;
      }
      console.log('Draft transaction:', draft_transaction.items);
      if (!draft_transaction.items || draft_transaction.items.length === 0) {
        setError('No items were detected in your order. Please try again and mention specific products.');
        return;
      }

      // Validate that items have required fields
      const invalidItems = draft_transaction.items.filter((item: any) => 
        !item.name || item.name.trim() === '' || 
        !item.product_id || 
        item.quantity <= 0 || 
        item.unit_price <= 0
      );

      if (invalidItems.length > 0) {
        setError('Some items in your order are invalid. Please try again with clear product names and quantities.');
        return;
      }

      const totalAmount = draft_transaction.items.reduce((sum: any, item: any) => sum + (item.unit_price * item.quantity), 0);

      setOrderConfirmation({
        ...draft_transaction,
        total: totalAmount,
        transcript: transcript || 'No transcription available',
      });

    } catch (err) {
      setError('Failed to process your order. Please try again.');
      console.error('Error processing order:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to update item quantity
  const updateItemQuantity = (productId: number, newQuantity: number) => {
    if (!orderConfirmation) return;

    const updatedItems = orderConfirmation.items.map(item => {
      if (item.product_id === productId) {
        return { ...item, quantity: Math.max(0, newQuantity) };
      }
      return item;
    }).filter(item => item.quantity > 0); // Remove items with 0 quantity

    const newTotal = updatedItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

    setOrderConfirmation({
      ...orderConfirmation,
      items: updatedItems,
      total: newTotal
    });
  };

  // Function to remove item completely
  const removeItem = (productId: number) => {
    if (!orderConfirmation) return;

    const updatedItems = orderConfirmation.items.filter(item => item.product_id !== productId);
    const newTotal = updatedItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

    setOrderConfirmation({
      ...orderConfirmation,
      items: updatedItems,
      total: newTotal
    });
  };

  const confirmOrder = async () => {
    if (!orderConfirmation || orderConfirmation.items.length === 0) {
      showModal('error', 'Order Empty', 'Your order is empty. Please add some items before confirming.');
      return;
    }

    try {
      setIsProcessing(true);
      
      // Replace with your actual API endpoint for placing order
      const response = await fetch(`${API_BASE_URL}/transactions/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          umkm_id: orderConfirmation.umkm_id,
          transaction_type: orderConfirmation.transaction_type,
          supplier_id: orderConfirmation.supplier_id,
          transcript: orderConfirmation.transcript,
          items: orderConfirmation.items.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      // Reset state after successful order
      setOrderConfirmation(null);
      setError('');
      showModal('success', 'Order Successful!', `Your order has been placed successfully! Total: ${orderConfirmation.total.toFixed(2)}`);
  
      setTimeout(() => {
      closeModal();
    }, 3000); // Tutup setelah 3 detik

    } catch (err) {
      showModal('error', 'Order Failed', 'Failed to place your order. Please check your connection and try again.');
      console.error('Error placing order:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const recordAgain = () => {
    setOrderConfirmation(null);
    setError('');
  };

    return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Modal Popup */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity z-40"
              onClick={closeModal}
            ></div>

            {/* Modal panel */}
            <div className="relative inline-block align-bottom bg-white rounded-2xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6 z-50">
              <div>
                {/* Icon */}
                <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${
                  modal.type === 'success' 
                    ? 'bg-green-100' 
                    : modal.type === 'error' 
                    ? 'bg-red-100' 
                    : 'bg-blue-100'
                }`}>
                  {modal.type === 'success' && (
                    <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {modal.type === 'error' && (
                    <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  {modal.type === 'info' && (
                    <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>

                {/* Content */}
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className={`text-lg leading-6 font-medium ${
                    modal.type === 'success' 
                      ? 'text-green-900' 
                      : modal.type === 'error' 
                      ? 'text-red-900' 
                      : 'text-blue-900'
                  }`}>
                    {modal.title}
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      {modal.message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Button */}
              <div className="mt-5 sm:mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className={`inline-flex justify-center w-full rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:text-sm ${
                    modal.type === 'success'
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      : modal.type === 'error'
                      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                      : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  }`}
                >
                  {modal.type === 'success' ? 'Great!' : modal.type === 'error' ? 'Try Again' : 'Got it'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container (keeping existing toasts for other notifications if needed) */}
      <div className="fixed top-4 right-4 z-40 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`max-w-sm w-full shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 transform transition-all duration-300 ease-in-out ${
              toast.type === 'success' 
                ? 'bg-green-50 ring-green-200' 
                : toast.type === 'error' 
                ? 'bg-red-50 ring-red-200' 
                : 'bg-blue-50 ring-blue-200'
            }`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {toast.type === 'success' && (
                    <div className="h-6 w-6 text-green-400">
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {toast.type === 'error' && (
                    <div className="h-6 w-6 text-red-400">
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {toast.type === 'info' && (
                    <div className="h-6 w-6 text-blue-400">
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="ml-3 w-0 flex-1">
                  <p className={`text-sm font-medium ${
                    toast.type === 'success' 
                      ? 'text-green-800' 
                      : toast.type === 'error' 
                      ? 'text-red-800' 
                      : 'text-blue-800'
                  }`}>
                    {toast.message}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={() => removeToast(toast.id)}
                className={`w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium focus:outline-none focus:ring-2 ${
                  toast.type === 'success' 
                    ? 'text-green-600 hover:text-green-500 focus:ring-green-500' 
                    : toast.type === 'error' 
                    ? 'text-red-600 hover:text-red-500 focus:ring-red-500' 
                    : 'text-blue-600 hover:text-blue-500 focus:ring-blue-500'
                }`}
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

        <div className="max-w-md w-full">
        {/* Error Message */}
        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
            </div>
        )}

        {/* Recording Interface */}
        {!orderConfirmation && (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Voice Order</h1>
                <p className="text-gray-600">Speak your order clearly</p>
            </div>

            {/* Microphone Icon */}
            <div className="mb-8">
                <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${
                isRecording ? 'bg-red-500 animate-pulse' : 'bg-blue-500 hover:bg-blue-600'
                }`}>
                <svg 
                    className="w-16 h-16 text-white" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
                </div>
            </div>

            {/* Status Info */}
            <div className="mb-6">
                {isProcessing ? (
                <div>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Processing your order...</p>
                </div>
                ) : (
                <div>
                    <p className="text-lg text-gray-700 mb-2">
                    {isRecording ? 'Listening...' : 'Ready to take your order'}
                    </p>
                    <p className="text-sm text-gray-500">
                    {isRecording ? 'Speak clearly and tap stop when done' : 'Tap the microphone to start'}
                    </p>
                </div>
                )}
            </div>

            {/* Button */}
            <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200 ${
                isRecording 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {isProcessing ? 'Processing...' : isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
            </div>
        )}

                {/* Order Confirmation */}
        {orderConfirmation && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Order Confirmation</h2>
            </div>

            {/* Transcription */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium mb-2">What I heard:</p>
              <p className="text-gray-800 italic">"{orderConfirmation.transcript}"</p>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Your Order:</h3>
              {orderConfirmation.items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Your order is empty</p>
                  <p className="text-sm">Please record again to add items</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orderConfirmation.items.map((item, index) => (
                    <div key={`${item.product_id}-${index}`} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <span className="font-medium text-gray-800">{item.name}</span>
                          <p className="text-xs text-gray-500">${item.unit_price.toFixed(2)} each</p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateItemQuantity(item.product_id, item.quantity - 1)}
                            className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-sm"
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="w-10 text-center font-semibold text-lg">{item.quantity}</span>
                          <button
                            onClick={() => updateItemQuantity(item.product_id, item.quantity + 1)}
                            className="w-7 h-7 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center text-white font-bold text-sm"
                          >
                            +
                          </button>
                        </div>

                        <span className="font-bold text-lg text-gray-800 ml-4">
                          ${(item.unit_price * item.quantity).toFixed(2)}
                        </span>

                        <button
                          onClick={() => removeItem(item.product_id)}
                          className="text-red-500 hover:text-red-700 ml-3"
                          title="Remove item"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {orderConfirmation.items.length > 0 && (
                <div className="flex justify-between items-center pt-4 mt-4 border-t-2 border-gray-200">
                  <span className="text-lg font-bold">Total:</span>
                  <span className="text-xl font-bold text-green-600">
                    ${orderConfirmation.total.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Confirmation Buttons */}
            <div className="flex gap-3">
              <button
                onClick={recordAgain}
                disabled={isProcessing}
                className={`flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors ${
                  isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                🎤 Record Again
              </button>
              <button
                onClick={confirmOrder}
                disabled={isProcessing || orderConfirmation.items.length === 0}
                className={`flex-1 py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors ${
                  isProcessing || orderConfirmation.items.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isProcessing ? 'Placing...' : '✅ Confirm Order'}
              </button>
            </div>
          </div>
        )}
        </div>
    </div>
    );
}