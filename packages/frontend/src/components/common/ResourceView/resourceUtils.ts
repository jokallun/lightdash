import { assertUnreachable, ChartKind } from '@lightdash/common';
import moment from 'moment';
import { ResourceViewItem, ResourceViewItemType } from './resourceTypeUtils';

export const getResourceTypeName = (item: ResourceViewItem) => {
    switch (item.type) {
        case ResourceViewItemType.DASHBOARD:
            return 'Dashboard';
        case ResourceViewItemType.SPACE:
            return 'Space';
        case ResourceViewItemType.CHART:
            switch (item.data.chartType) {
                case undefined:
                case ChartKind.VERTICAL_BAR:
                    return 'Bar chart';
                case ChartKind.HORIZONTAL_BAR:
                    return 'Horizontal bar chart';
                case ChartKind.LINE:
                    return 'Line chart';
                case ChartKind.SCATTER:
                    return 'Scatter chart';
                case ChartKind.AREA:
                    return 'Area chart';
                case ChartKind.MIXED:
                    return 'Mixed chart';
                case ChartKind.TABLE:
                    return 'Table';
                case ChartKind.BIG_NUMBER:
                    return 'Big number';
                default:
                    return assertUnreachable(
                        item.data.chartType,
                        `Chart type ${item.data.chartType} not supported`,
                    );
            }
        default:
            return assertUnreachable(item, 'Resource type not supported');
    }
};

export const getResourceUrl = (projectUuid: string, item: ResourceViewItem) => {
    const itemType = item.type;
    switch (item.type) {
        case ResourceViewItemType.DASHBOARD:
            return `/projects/${projectUuid}/dashboards/${item.data.uuid}/view`;
        case ResourceViewItemType.CHART:
            return `/projects/${projectUuid}/saved/${item.data.uuid}`;
        case ResourceViewItemType.SPACE:
            return `/projects/${projectUuid}/spaces/${item.data.uuid}`;
        default:
            return assertUnreachable(item, `Can't get URL for ${itemType}`);
    }
};

export const getResourceName = (type: ResourceViewItemType) => {
    switch (type) {
        case ResourceViewItemType.DASHBOARD:
            return 'Dashboard';
        case ResourceViewItemType.CHART:
            return 'Chart';
        case ResourceViewItemType.SPACE:
            return 'Space';
        default:
            return assertUnreachable(type, 'Resource type not supported');
    }
};

export const getResourceViewsSinceWhenDescription = (
    item: ResourceViewItem,
) => {
    if (
        item.type !== ResourceViewItemType.CHART &&
        item.type !== ResourceViewItemType.DASHBOARD
    ) {
        throw new Error('Only supported for charts and dashboards');
    }

    return item.data.firstViewedAt
        ? `${item.data.views} views since ${moment(
              item.data.firstViewedAt,
          ).format('MMM D, YYYY h:mm A')}`
        : undefined;
};
