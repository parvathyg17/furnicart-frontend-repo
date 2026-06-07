/**
 * Small status pill. Pass `className` for palette (e.g. order line badges).
 */
export default function StatusBadge(
  {
    children,
    className = "",
    as: Comp = "span",
    ...rest
  },
) {

  return (

    <Comp
      className={className}
      {...rest}
    >
      {children}
    </Comp>
  );
}
