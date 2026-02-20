import { useSearchParams } from 'react-router-dom';

import Worksheet from './Worksheet';
import WorksheetEditMode from './WorksheetEditMode';

const EDIT_VIEW_MODE_VALUE = 'edit';

export default function WorksheetRoute() {
  const [searchParams] = useSearchParams();
  const rawViewMode = searchParams.get('viewmode') ?? searchParams.get('mode');

  const normalizedViewMode = rawViewMode
    ? decodeURIComponent(rawViewMode).trim().replace(/^"|"$/g, '').toLowerCase()
    : null;

  if (normalizedViewMode === EDIT_VIEW_MODE_VALUE) {
    return <WorksheetEditMode />;
  }

  return <Worksheet />;
}
