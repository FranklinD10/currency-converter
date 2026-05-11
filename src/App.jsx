import { useState, useEffect } from 'react';

function App() {
  const [rates, setRates] = useState({ LRD: null, GHS: null, USD: 1 });
  const [values, setValues] = useState({ USD: '', LRD: '', GHS: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();
        if (data && data.rates) {
          setRates({
            USD: 1,
            LRD: data.rates.LRD,
            GHS: data.rates.GHS
          });
        } else {
          setError('Failed to fetch rates');
        }
      } catch (err) {
        setError('Error fetching rates');
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, []);

  const handleChange = (currency, value) => {
    if (value === '') {
      setValues({ USD: '', LRD: '', GHS: '' });
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return; // Allow typing dots, handle carefully or ignore invalid
    // For simplicity, we just parse standard floats. To be robust, handle string state.
  };

  const handleInputChange = (e, currency) => {
    const val = e.target.value;

    // allow empty or valid number (including trailing dots for typing)
    if (val !== '' && !/^\d*\.?\d*$/.test(val)) return;

    if (val === '') {
      setValues({ USD: '', LRD: '', GHS: '' });
      return;
    }

    const numValue = parseFloat(val);

    if (isNaN(numValue)) {
       // It might be just a dot, keep it in state but don't convert yet
       setValues({ ...values, [currency]: val });
       return;
    }

    // Convert to USD first
    const inUsd = numValue / rates[currency];

    setValues({
      USD: currency === 'USD' ? val : (inUsd * rates.USD).toFixed(2),
      LRD: currency === 'LRD' ? val : (inUsd * rates.LRD).toFixed(2),
      GHS: currency === 'GHS' ? val : (inUsd * rates.GHS).toFixed(2),
    });
  };


  if (loading) return <div className="flex justify-center items-center h-screen"><p className="text-xl">Loading rates...</p></div>;
  if (error) return <div className="flex justify-center items-center h-screen"><p className="text-xl text-red-500">{error}</p></div>;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Currency Converter</h1>

        <div className="space-y-6">
          {/* USD Input */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600 mb-2 flex justify-between">
              <span>US Dollar (USD)</span>
              <span className="text-xs text-gray-400">Rate: 1.00</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="text"
                inputMode="decimal"
                className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-lg"
                placeholder="0.00"
                value={values.USD}
                onChange={(e) => handleInputChange(e, 'USD')}
              />
            </div>
          </div>

          {/* LRD Input */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600 mb-2 flex justify-between">
              <span>Liberian Dollar (LRD)</span>
              <span className="text-xs text-gray-400">Rate: {rates.LRD.toFixed(2)}</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">L$</span>
              <input
                type="text"
                inputMode="decimal"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-lg"
                placeholder="0.00"
                value={values.LRD}
                onChange={(e) => handleInputChange(e, 'LRD')}
              />
            </div>
          </div>

          {/* GHS Input */}
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-600 mb-2 flex justify-between">
              <span>Ghanaian Cedi (GHS)</span>
              <span className="text-xs text-gray-400">Rate: {rates.GHS.toFixed(2)}</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">GH₵</span>
              <input
                type="text"
                inputMode="decimal"
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-lg"
                placeholder="0.00"
                value={values.GHS}
                onChange={(e) => handleInputChange(e, 'GHS')}
              />
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Rates updated automatically. Created by Franklin.
        </p>
      </div>
    </div>
  );
}

export default App;
