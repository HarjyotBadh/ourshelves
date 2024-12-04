import React from 'react';
import { LinkGraphicContainer, LinkText } from "styles/LinkStyles";

interface LinkGraphicProps {
  linkName: string;
  color?: string;
}

const LinkGraphic: React.FC<LinkGraphicProps> = ({ linkName, color }) => {
  return (
    <LinkGraphicContainer>
      <LinkText
        numberOfLines={2}
        style={{
          backgroundColor: color || '#8B4513',
        }}
      >
        {linkName || "Link"}
      </LinkText>
    </LinkGraphicContainer>
  );
};

export default LinkGraphic;