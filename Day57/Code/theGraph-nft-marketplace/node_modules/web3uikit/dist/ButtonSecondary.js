import { s as styled$1, B as ButtonBase, c as color, j as jsx } from "./index.js";
import "react";
import "react-router-dom";
import "react-moralis";
const ButtonSecondaryStyled$1 = styled$1(ButtonBase)`
    background-color: ${color.blueLight};
    border-color: ${color.blueLight};
    color: ${color.blue};

    :active {
        border-color: ${color.blue};
    }

    :focus {
        box-shadow: 0px 0px 0px 2px ${color.paleCerulean};
    }

    svg {
        fill: ${color.blue};
    }
`;
var styles = {
  ButtonSecondaryStyled: ButtonSecondaryStyled$1
};
const {
  ButtonSecondaryStyled
} = styles;
const ButtonSecondary = ({
  ...props
}) => /* @__PURE__ */ jsx(ButtonSecondaryStyled, {
  ...props
});
export { ButtonSecondary as default };
