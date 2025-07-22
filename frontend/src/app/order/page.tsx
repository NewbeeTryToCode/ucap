'use client';

import { useState, useRef } from 'react';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface OrderConfirmation {
  items: OrderItem[];
  total: number;
  transcription: string;
}

export default function OrderPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState<OrderConfirmation | null>(null);
  const [error, setError] = useState<string>('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

      // Replace with your actual API endpoint
      const response = await fetch('/api/process-order', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process order');
      }

      const orderData: OrderConfirmation = await response.json();
      setOrderConfirmation(orderData);
    } catch (err) {
      setError('Failed to process your order. Please try again.');
      console.error('Error processing order:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmOrder = async () => {
    if (!orderConfirmation) return;

    try {
      setIsProcessing(true);
      
      // Replace with your actual API endpoint for placing order
      const response = await fetch('/api/place-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: orderConfirmation.items,
          total: orderConfirmation.total,
          transcription: orderConfirmation.transcription,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      // Reset state after successful order
      setOrderConfirmation(null);
      setError('');
      alert('Order placed successfully!'); // You can replace this with a better notification
    } catch (err) {
      setError('Failed to place order. Please try again.');
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
                <p className="text-gray-800 italic">"{orderConfirmation.transcription}"</p>
            </div>

            {/* Order Items */}
            <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Your Order:</h3>
                <div className="space-y-2">
                {orderConfirmation.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                        <span className="font-medium">{item.name}</span>
                        <span className="text-gray-500 ml-2">x{item.quantity}</span>
                    </div>
                    <span className="font-medium">${item.price.toFixed(2)}</span>
                    </div>
                ))}
                </div>

                <div className="flex justify-between items-center pt-4 mt-4 border-t-2 border-gray-200">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-xl font-bold text-green-600">
                    ${orderConfirmation.total.toFixed(2)}
                </span>
                </div>
            </div>

            {/* Confirmation Buttons */}
            <div className="flex gap-3">
                <button
                onClick={recordAgain}
                className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
                >
                🎤 Record Again
                </button>
                <button
                onClick={confirmOrder}
                disabled={isProcessing}
                className={`flex-1 py-3 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors ${
                    isProcessing ? 'opacity-50 cursor-not-allowed' : ''
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