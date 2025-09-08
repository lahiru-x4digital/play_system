import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

export default function AddToCart({onAddToCart,kidsCount,setKidsCount}) {
  const [kids, setKids] = useState([
    { name: '', birthday: '' }
  ]);

  const handleKidChange = (index, field, value) => {
    const updatedKids = [...kids];
    updatedKids[index] = { ...updatedKids[index], [field]: value };
    setKids(updatedKids);
  };

  const addKid = () => {
    if (kids.length < kidsCount) {
      setKids([...kids, { name: '', birthday: '' }]);
    } else if (kids.length > kidsCount) {
      setKids(kids.slice(0, kidsCount));
    }
  };

  const removeKid = (index) => {
    const updatedKids = [...kids];
    updatedKids.splice(index, 1);
    setKids(updatedKids);
    setKidsCount(kidsCount - 1);
  };

  React.useEffect(() => {
    addKid();
  }, [kidsCount]);

  return (
    <div className="mt-6 p-6 border rounded-lg bg-white">
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Number of Kids</label>
        <Input 
          type="number" 
          min="1" 
          value={kidsCount} 
          onChange={(e) => setKidsCount(Math.max(1, parseInt(e.target.value)))} 
          className="w-24"
        />
      </div>

      <div className="space-y-6">
        {kids.map((kid, index) => (
          <div key={index} className="p-4 border rounded-lg relative">
            {index > 0 && (
              <button
                type="button"
                onClick={() => removeKid(index)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                aria-label="Remove kid"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            
            <h3 className="font-medium mb-4">Kid {index + 1}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  type="text"
                  value={kid.name}
                  onChange={(e) => handleKidChange(index, 'name', e.target.value)}
                  placeholder="Enter name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Birthday</label>
                <Input
                  type="date"
                  value={kid.birthday}
                  onChange={(e) => handleKidChange(index, 'birthday', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Button onClick={() => {
            onAddToCart(kids)
            //reset data
            setKids([
                { name: '', birthday: '' }
              ]);
              setKidsCount("");
        }} className="w-full sm:w-auto">
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
