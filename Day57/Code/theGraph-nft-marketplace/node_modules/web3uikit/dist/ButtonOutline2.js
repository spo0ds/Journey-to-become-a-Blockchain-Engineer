import { f as styled$1$1, h as ButtonBase, e as color$1, k as gradientColors, i as jsx$2 } from "./index.js";
import "react";
import "react-moralis";
import "react-router-dom";
const ButtonOutlineStyled$1 = styled$1$1(ButtonBase)`
    background-color: ${color$1.white};
    border-color: ${color$1.beauBlue};
    color: ${color$1.blue};

    :hover {
        background-color: ${gradientColors.beauBlue};
        border-color: transparent;
        color: ${color$1.blue};

        svg {
            color: ${color$1.blue};
        }
    }

    :active {
        box-shadow: 0px 0px 0px 2px ${color$1.blueDark};
    }

    :focus {
        box-shadow: 0px 0px 0px 2px ${color$1.paleCerulean};
    }

    svg {
        color: ${color$1.blue};
    }
`;
var styles = {
  ButtonOutlineStyled: ButtonOutlineStyled$1
};
const {
  ButtonOutlineStyled
} = styles;
const ButtonOutline = ({
  ...props
}) => /* @__PURE__ */ jsx$2(ButtonOutlineStyled, {
  ...props
});
export { ButtonOutline as default };
