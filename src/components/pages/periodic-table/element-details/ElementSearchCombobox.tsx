import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getElementStyle } from '../utils/element-styles';
import { useTranslation } from 'react-i18next';

// Define the element type
interface PeriodicElement {
  atomicNumber: number;
  atomicGroup: string;
  atomicName: string;
  atomicSymbol: string;
}

interface ElementSearchComboboxProps {
  theme?: string;
  elementPathSegment: string;
  navigationPath: string;
}

// Load the periodic elements data
import periodicListData from '@/data/table-periodic/periodic_list.json';

const periodicElements: PeriodicElement[] = periodicListData;

export function ElementSearchCombobox({ theme = 'theme1', elementPathSegment, navigationPath }: ElementSearchComboboxProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string>('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Set initial value based on current URL
  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const atomicNumber = pathParts[pathParts.indexOf(elementPathSegment) + 1];
    if (atomicNumber) {
      setValue(atomicNumber);
    }
  }, [elementPathSegment]);

  const selectedElement = periodicElements.find(
    (element) => element.atomicNumber.toString() === value
  );

  const handleSelect = (atomicNumber: string) => {
    setValue(atomicNumber);
    setOpen(false);
    
    // Navigate to the selected element's page
    navigate({
      to: navigationPath,
      params: { id: atomicNumber },
    });
  };

  return (
    <div className="w-full max-w-sm">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            {selectedElement ? (
              <div className="flex items-center">
                <span 
                  className="mr-2 font-bold"
                  style={{ color: getElementStyle(selectedElement.atomicGroup, theme).atomColor }}
                >
                  {selectedElement.atomicSymbol}
                </span>
                <span>{selectedElement.atomicName} (#{selectedElement.atomicNumber})</span>
              </div>
            ) : (
              t('periodicTable.elementDetail.selectElement', 'Select element...')
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder={t('periodicTable.elementDetail.searchElements', 'Search elements...')} />
            <CommandList>
              <CommandEmpty>{t('periodicTable.elementDetail.noElementFound', 'No element found.')}</CommandEmpty>
              <CommandGroup>
                {periodicElements.map((element) => {
                  const elementStyle = getElementStyle(element.atomicGroup, theme);
                  return (
                    <CommandItem
                      key={element.atomicNumber}
                      value={element.atomicNumber.toString()}
                      onSelect={handleSelect}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === element.atomicNumber.toString() 
                            ? 'opacity-100' 
                            : 'opacity-0'
                        )}
                      />
                      <div className="flex items-center">
                        <span 
                          className="mr-2 font-bold"
                          style={{ color: elementStyle.atomColor }}
                        >
                          {element.atomicSymbol}
                        </span>
                        <span>{element.atomicName} (#{element.atomicNumber})</span>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}