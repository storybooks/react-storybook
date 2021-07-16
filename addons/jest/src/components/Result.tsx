import React, { Fragment, FunctionComponent, useState } from 'react';
import { styled, themes, convert } from '@storybook/theming';
import { Icons } from '@storybook/components';
import { Message } from './Message';

const Wrapper = styled.div<{ status: string }>(({ theme, status }) => ({
  display: 'flex',
  width: '100%',
  borderTop: `1px solid ${theme.appBorderColor}`,
  '&:hover': {
    background: status === `failed` ? theme.background.hoverable : null,
  },
}));

const HeaderBar = styled.div<{ status: string }>(({ theme, status }) => ({
  padding: theme.layoutMargin,
  paddingLeft: theme.layoutMargin - 3,
  background: 'none',
  color: 'inherit',
  textAlign: 'left',
  cursor: status === `failed` ? 'pointer' : null,
  borderLeft: '3px solid transparent',
  width: '100%',
  display: 'flex',

  '&:focus': {
    outline: '0 none',
    borderLeft: `3px solid ${theme.color.secondary}`,
  },
}));

const Icon = styled<any, any>(Icons)(({ theme }) => ({
  height: 10,
  width: 10,
  minWidth: 10,
  color: theme.color.mediumdark,
  marginRight: 10,
  transition: 'transform 0.1s ease-in-out',
  alignSelf: 'center',
  display: 'inline-flex',
}));

const capitalizeFirstLetter = (text: string) => text.charAt(0).toUpperCase().concat(text.slice(1));

interface ResultProps {
  fullName?: string;
  title?: string;
  failureMessages: any;
  status: string;
}

export const Result: FunctionComponent<ResultProps> = ({
  fullName,
  title,
  failureMessages,
  status,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const onToggle = () => {
    setIsOpen(!isOpen);
  };
  return (
    <Fragment>
      <Wrapper status={status}>
        <HeaderBar onClick={onToggle} role="button" status={status}>
          {status === `failed` ? (
            <Icon
              icon="chevrondown"
              size={10}
              color={convert(themes.normal).color.mediumdark}
              style={{
                transform: `rotate(${isOpen ? 0 : -90}deg)`,
              }}
            />
          ) : null}
          <div>{capitalizeFirstLetter(fullName) || capitalizeFirstLetter(title)}</div>
        </HeaderBar>
      </Wrapper>
      {isOpen ? (
        <Fragment>
          {failureMessages.map((msg: string, i: number) => (
            // eslint-disable-next-line react/no-array-index-key
            <Message msg={msg} key={i} />
          ))}
        </Fragment>
      ) : null}
    </Fragment>
  );
};

export default Result;
