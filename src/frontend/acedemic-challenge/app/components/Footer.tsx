export function Footer() {
    return (
        <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            maxHeight: "10%",
            flexShrink: 0,
        }}>
            <img src={"./ulisboa_horizontal_logo_negative.png"} alt={"ULisboa Logo"} style={{
                maxWidth: "50%",
                maxHeight: "100%",
                objectFit: "contain",
            }} />
            <img src={"./sucesso_logo.png"} alt={"Sucesso no Ensino Superior Logo"} style={{
                maxWidth: "50%",
                maxHeight: "100%",
                objectFit: "contain",
            }} />
        </div>
    );
}