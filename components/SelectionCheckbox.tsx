
import React from 'react';
import CheckIcon from './icons/CheckIcon';

interface SelectionCheckboxProps {
  isSelected: boolean;
}

const SelectionCheckbox: React.FC<SelectionCheckboxProps> = ({ isSelected }) => (
  <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${isSelected ? 'bg-white border-white' : 'bg-black/30 border-gray-500 group-hover:border-white'}`}>
    {isSelected && <CheckIcon className="w-4 h-4 text-black" />}
  </div>
);

export default SelectionCheckbox;
