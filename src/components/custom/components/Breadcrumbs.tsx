import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import {useBreadcrumbs} from '@/hooks/use-breadcrumbs';
// import {TbSlash} from "react-icons/tb";
import {Fragment} from 'react';
import {AppRoute} from "@/constants/app-route";
import AppLogo from "@/assets/app/logo.png"

export function Breadcrumbs() {
  const items = useBreadcrumbs(AppRoute);
  if (items.length === 0) return null;

  return (
    <div className="flex flex-row gap-x-4 w-full">
      <img src={AppLogo} alt={"Logo"} style={{height: 24, width: 95, flexShrink: 0}}/>
      <Breadcrumb className="min-w-0 flex-1  max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[500px] xl:max-w-[600px] 2xl:max-w-[800px]">
        <BreadcrumbList>
          {items.map((item: Record<string, any>, index: number) => (
            <Fragment key={item.title}>
              {index !== items.length - 1 && (
                <BreadcrumbItem className='hidden md:block'>
                  <BreadcrumbLink href={item.link}>{item.title}</BreadcrumbLink>
                </BreadcrumbItem>
              )}
              {index < items.length - 1 && (
                <BreadcrumbSeparator className='hidden md:block'>
                  {/* <TbSlash/> */}
                </BreadcrumbSeparator>
              )}
              {index === items.length - 1 && (
                <BreadcrumbPage
                  className="truncate">
                  {item.title}
                </BreadcrumbPage>
              )}
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}