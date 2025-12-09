import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Plus, Check } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CategoryOption {
  label: string;
  value: string;
}

interface CategorySelectWithAddProps {
  options: CategoryOption[];
  onValueChange: (value: string) => void;
  value: string;
  className?: string;
  radioClassName?: string;
  onAddCategory?: (category: CategoryOption) => void;
}

export function CategorySelectWithAdd({
  options,
  onValueChange,
  value,
  className,
  radioClassName,
  onAddCategory,
}: CategorySelectWithAddProps) {
  const [showInput, setShowInput] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [customCategories, setCustomCategories] = useState<CategoryOption[]>(
    []
  );

  const allOptions = [...options, ...customCategories];

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      const categoryValue = newCategory.toUpperCase().replace(/\s+/g, "_");
      const newOption: CategoryOption = {
        label: newCategory.trim(),
        value: categoryValue,
      };

      setCustomCategories([...customCategories, newOption]);
      onValueChange(categoryValue);
      if (onAddCategory) {
        onAddCategory(newOption);
      }
      setNewCategory("");
      setShowInput(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCategory();
    } else if (e.key === "Escape") {
      setShowInput(false);
      setNewCategory("");
    }
  };

  return (
    <div className="space-y-3">
      <RadioGroup
        value={value}
        onValueChange={onValueChange}
        className={cn("flex flex-wrap gap-x-2", className)}
      >
        {allOptions.map((option, index) => (
          <div
            className={cn(
              "flex bg-[#E0E0E0] w-full lg:w-[150px] h-[44px] px-3 rounded-full items-center gap-x-2",
              radioClassName
            )}
            key={index}
          >
            <RadioGroupItem value={option.value} id={`category-${index}`} />
            <label
              htmlFor={`category-${index}`}
              className="text-sm text-secondary-text cursor-pointer flex-1"
            >
              {option.label}
            </label>
          </div>
        ))}
      </RadioGroup>

      {showInput ? (
        <div className="flex items-center gap-2">
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter category name"
            className="!rounded-2xl border border-neutral-accent"
            autoFocus
          />
          <Button
            type="button"
            onClick={handleAddCategory}
            size="icon"
            className="flex-shrink-0"
          >
            <Check size={18} />
          </Button>
          <Button
            type="button"
            onClick={() => {
              setShowInput(false);
              setNewCategory("");
            }}
            size="icon"
            variant="secondary"
            className="flex-shrink-0"
          >
            ✕
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          onClick={() => setShowInput(true)}
          variant="secondary"
          className="w-full lg:w-auto"
        >
          <Plus size={18} className="mr-2" />
          Add Category
        </Button>
      )}
    </div>
  );
}
