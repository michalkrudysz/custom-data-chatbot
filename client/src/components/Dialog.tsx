// Dialog.tsx

type DialogProps = {
  imageSrc: string;
  containerTop: string;
  containerLeft: string;
  backgroundColor?: string;
  color?: string;
  width?: string;
  content: string;
};

const getDialogStyles = (
  backgroundColor: string = "#b2b3ff",
  borderRadius: string = "2rem",
  color: string = "#121113",
  width: string = "20rem"
) => ({
  position: "absolute" as const,
  backgroundColor,
  borderRadius,
  padding: "0.9rem",
  top: "50%",
  left: "calc(4.2rem + 20px)",
  transform: "translateY(-50%)",
  fontSize: "0.4em",
  width,
  marginLeft: "0.4rem",
  color,
  paddingLeft: "1.1rem",
});

const containerStyles = (top: string, left: string) => ({
  position: "absolute",
  top,
  left,
  display: "flex",
  alignItems: "center",
  padding: "20px",
});

const avatarStyles = {
  width: "4.2rem",
  height: "4.2rem",
  borderRadius: "50%",
  objectFit: "cover",
};

const Dialog = ({
  imageSrc,
  containerTop,
  containerLeft,
  backgroundColor = "#b2b3ff",
  color = "#121113",
  width = "20rem",
  content,
}: DialogProps) => {
  const dialogStyles = getDialogStyles(backgroundColor, "2rem", color, width);
  const dynamicContainerStyles = containerStyles(containerTop, containerLeft);

  return (
    <div style={dynamicContainerStyles}>
      <img src={imageSrc} alt="Avatar" style={avatarStyles} />
      <div style={dialogStyles}>
        <h1>{content}</h1>
      </div>
    </div>
  );
};

export default Dialog;
