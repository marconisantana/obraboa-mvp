import { useTranslation } from 'react-i18next';
import type { DocumentFolder } from '@/hooks/useDocuments';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface Props {
  trail: DocumentFolder[];
  onNavigate: (folderId: string | null) => void;
}

export default function DocumentBreadcrumb({ trail, onNavigate }: Props) {
  const { t } = useTranslation();

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {trail.length === 0 ? (
            <BreadcrumbPage>{t('documents.rootFolder')}</BreadcrumbPage>
          ) : (
            <BreadcrumbLink className="cursor-pointer" onClick={() => onNavigate(null)}>
              {t('documents.rootFolder')}
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>

        {trail.map((folder, i) => (
          <span key={folder.id} className="contents">
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {i === trail.length - 1 ? (
                <BreadcrumbPage>{folder.name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink className="cursor-pointer" onClick={() => onNavigate(folder.id)}>
                  {folder.name}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </span>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
