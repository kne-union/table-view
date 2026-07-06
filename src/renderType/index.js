import defaultRender from './default';
import main from './main';
import amount from './amount';
import tag from './tag';
import tagList from './tagList';
import status from './status';
import list from './list';
import options from './options';
import description from './description';
import { globalParams } from '../globalParams';

const renderType = {
  default: defaultRender,
  main,
  amount,
  tag,
  tagList,
  status,
  list,
  options,
  description
};

globalParams.renderType = renderType;

export default renderType;

export { getTagColor, normalizeTagItem, renderTagItem, renderTagList } from './tagUtils';
export { getStatusType, normalizeStatusItem, renderStatusItem } from './statusUtils';
