import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { AppRoute } from '@/constants/app-route';

interface ElementErrorDisplayProps {
  error?: Error | { response?: { data?: { message?: string } }; message?: string };
  atomicNumber?: number;
}

export function ElementErrorDisplay({ error, atomicNumber }: ElementErrorDisplayProps) {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-3">
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-red-700 dark:text-red-300">
            {t('periodicTable.elementDetail.errorLoading')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">
            {t('periodicTable.elementDetail.failedToLoadMessage', { atomicNumber })}
          </p>
          <p className="text-red-500 dark:text-red-300 text-sm italic">
            {(error && 'response' in error && error.response?.data?.message) || error?.message || t('periodicTable.elementDetail.unknownError')}
          </p>
          <div className="mt-6">
            <Link to={AppRoute.periodicTable.periodicTable.url}>
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                {t('periodicTable.elementDetail.goToPeriodicTable')}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}