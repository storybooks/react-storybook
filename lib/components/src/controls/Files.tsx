import React, { ChangeEvent, FunctionComponent } from 'react';
import { styled } from '@storybook/theming';
import { ControlProps } from '../types';

import { Form } from '../form';
import { getControlId } from './helpers';

export interface FilesControlProps extends ControlProps<string[]> {
  accept?: string;
}

const FileInput = styled(Form.Input)({
  padding: 10,
});

function revokeOldUrls(urls: string[]) {
  urls.forEach((url) => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  });
}

export const FilesControl: FunctionComponent<FilesControlProps> = ({
  onChange,
  name,
  accept = 'image/*',
  value,
}) => {
  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) {
      return;
    }
    const fileUrls = Array.from(e.target.files).map((file) => URL.createObjectURL(file));
    onChange(fileUrls);
    revokeOldUrls(value);
  }

  return (
    <FileInput
      id={getControlId(name)}
      type="file"
      name={name}
      multiple
      onChange={handleFileChange}
      accept={accept}
      size="flex"
    />
  );
};
