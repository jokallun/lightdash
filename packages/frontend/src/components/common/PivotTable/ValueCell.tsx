import {
    ConditionalFormattingConfig,
    Field,
    getConditionalFormattingConfig,
    getConditionalFormattingDescription,
    PivotMetricValue,
    TableCalculation,
} from '@lightdash/common';
import { Box, Text, Tooltip } from '@mantine/core';
import { mergeRefs, useClipboard, useHotkeys } from '@mantine/hooks';
import { darken } from 'polished';
import {
    FC,
    ForwardedRef,
    forwardRef,
    useCallback,
    useMemo,
    useState,
} from 'react';
import { readableColor } from '../../../utils/colorUtils';
import { getConditionalRuleLabel } from '../Filters/configs';
import ValueCellMenu from './ValueCellMenu';

interface ValueCellProps {
    value: PivotMetricValue | null;
    conditionalFormattings: ConditionalFormattingConfig[];
    getField: (fieldId: string) => Field | TableCalculation;
}

interface ForwardRefProps {
    render: (
        props: React.HTMLAttributes<HTMLTableCellElement>,
        ref: ForwardedRef<HTMLTableCellElement> | null,
    ) => JSX.Element;
}

const ForwardRef = forwardRef<HTMLTableCellElement, ForwardRefProps>(
    (props, ref) => props.render(props, ref),
);

const ValueCell: FC<ValueCellProps> = ({
    value,
    conditionalFormattings,
    getField,
}) => {
    const field = useMemo(
        () => (value?.fieldId ? getField(value.fieldId) : undefined),
        [value, getField],
    );

    const conditionalFormatting = useMemo(() => {
        const conditionalFormattingConfig = getConditionalFormattingConfig(
            field,
            value?.raw,
            conditionalFormattings,
        );

        const tooltipContent = getConditionalFormattingDescription(
            field,
            conditionalFormattingConfig,
            getConditionalRuleLabel,
        );

        return {
            tooltipContent,
            color: conditionalFormattingConfig
                ? readableColor(conditionalFormattingConfig.color)
                : undefined,
            backgroundColor: conditionalFormattingConfig?.color,
        };
    }, [conditionalFormattings, field, value]);

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // TODO: optimisation - can be one hook on the parent
    const clipboard = useClipboard({ timeout: 200 });

    const handleCopy = useCallback(() => {
        if (isMenuOpen) {
            clipboard.copy(value?.formatted);
        }
    }, [clipboard, value, isMenuOpen]);

    useHotkeys([['mod+c', handleCopy]]);

    return (
        <ValueCellMenu
            opened={isMenuOpen}
            onOpen={() => setIsMenuOpen(true)}
            onClose={() => setIsMenuOpen(false)}
            value={value}
            onCopy={handleCopy}
        >
            <ForwardRef
                render={(menuProps, menuRef) => (
                    <Tooltip
                        disabled={!conditionalFormatting.tooltipContent}
                        label={conditionalFormatting.tooltipContent}
                        withinPortal
                        withArrow
                    >
                        <ForwardRef
                            render={(tooltipProps, tooltipRef) => (
                                <Box
                                    component="td"
                                    ref={mergeRefs(menuRef, tooltipRef)}
                                    {...tooltipProps}
                                    {...menuProps}
                                    data-copied={clipboard.copied}
                                    sx={(theme) => ({
                                        transition: 'all 100ms ease-in-out',

                                        color: conditionalFormatting.color,
                                        backgroundColor:
                                            conditionalFormatting.backgroundColor,
                                        borderLeftColor:
                                            conditionalFormatting.backgroundColor,

                                        '&[data-expanded="true"]': {
                                            backgroundColor:
                                                conditionalFormatting.backgroundColor
                                                    ? darken(0.1)(
                                                          conditionalFormatting.backgroundColor,
                                                      )
                                                    : theme.colors.blue[0],
                                            outline:
                                                conditionalFormatting.backgroundColor
                                                    ? 'none'
                                                    : `1px solid ${theme.colors.blue[5]}`,
                                        },

                                        '&[data-copied="true"]': {
                                            color: theme.black,
                                            backgroundColor:
                                                theme.colors.blue[1],
                                        },
                                    })}
                                >
                                    <Text>{value?.formatted}</Text>
                                </Box>
                            )}
                        />
                    </Tooltip>
                )}
            />
        </ValueCellMenu>
    );
};

export default ValueCell;
