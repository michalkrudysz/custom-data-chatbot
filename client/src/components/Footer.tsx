import classes from "./Footer.module.scss";

export default function Footer() {
  const getCurrentYear = () => {
    return new Date().getFullYear();
  };

  return (
    <footer className={classes.footer}>
      <div className={classes["footer-content"]}>
        <p>
          &copy; {getCurrentYear()}{" "}
          <a href="https://krudysz.pl/">Michał Krudysz</a>
        </p>
      </div>
    </footer>
  );
}
