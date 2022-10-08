import { C as Ce$1, g as getShade, c as color, s as styled$1, B as ButtonBase, j as jsx } from "./index.js";
import "react";
import "react-router-dom";
import "react-moralis";
const coloredShades = Ce$1`
    :after {
        background-color: ${getShade("light", 90)};
    }

    :hover {
        :after {
            background-color: ${getShade("light", 70)};
        }
    }

    :active {
        :after {
            background-color: ${getShade("light", 50)};
        }
    }
`;
const coloredRed = Ce$1`
    background-color: ${color.red};
    border-color: ${color.red};
    color: ${color.red};

    :focus {
        box-shadow: 0px 0px 0px 2px ${color.paleCerulean};
    }

    svg {
        fill: ${color.red};
    }

    ${coloredShades}
`;
const coloredGreen = Ce$1`
    background-color: ${color.green};
    border-color: ${color.green};
    color: ${color.green};

    :focus {
        box-shadow: 0px 0px 0px 2px ${color.paleCerulean};
    }

    svg {
        fill: ${color.green};
    }

    ${coloredShades}
`;
const coloredBlue = Ce$1`
    background-color: ${color.blue};
    border-color: ${color.blue};
    color: ${color.blue};

    :focus {
        box-shadow: 0px 0px 0px 2px ${color.paleCerulean};
    }

    svg {
        fill: ${color.blue};
    }

    ${coloredShades}
`;
const coloredYellow = Ce$1`
    background-color: ${color.yellow};
    border-color: ${color.yellow};
    color: ${color.yellow};

    :focus {
        box-shadow: 0px 0px 0px 2px ${color.paleCerulean};
    }

    svg {
        fill: ${color.yellow};
    }

    ${coloredShades}
`;
const getColored = (color2) => {
  switch (color2) {
    case "red":
      return coloredRed;
    case "green":
      return coloredGreen;
    case "blue":
      return coloredBlue;
    case "yellow":
      return coloredYellow;
    default:
      return;
  }
};
const ButtonColoredStyled$1 = styled$1(ButtonBase)`
    :after {
        background-color: ${getShade("dark", 0)};
        content: '';
        display: block;
        height: 100%;
        left: 0;
        pointer-events: none;
        position: absolute;
        top: 0;
        transition: all 0.3s ease;
        width: 100%;
        z-index: 0;
    }

    ${({
  color: color2
}) => color2 && getColored(color2)}
`;
var styles = {
  ButtonColoredStyled: ButtonColoredStyled$1
};
const {
  ButtonColoredStyled
} = styles;
const ButtonColored = ({
  color: color2,
  ...props
}) => /* @__PURE__ */ jsx(ButtonColoredStyled, {
  color: color2,
  ...props
});
export { ButtonColored as default };
