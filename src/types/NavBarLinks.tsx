
export const NAV_LINKS = ["Inicio", "Plataforma", "Recursos" /*, "Precios"*/] as const;
export interface GlassStyles {
    container: string
    container2: string
    text: string
    themeBtn: string
}

export interface DropDownProps {
    show: boolean
    cardWidth: number
    setFlag: (h: boolean) => void
    activeIndex: number | null
    contentRef: (instance: HTMLDivElement | null) => void
    glassStyles: GlassStyles
}

export interface VariantCard1 {
    glassStyles: GlassStyles
    title: string
    subTitle?: string
    IconString?: string
    link: string
    currentPath: string
}

export interface VariantCard2 {
    glassStyles: GlassStyles
    title: string
    link: string
    IconString: string
    currentPath: string
}

// eslint-disable-next-line react-refresh/only-export-components
export const InfoCards = [
    {
        sections: [
            {
                cards: [
                    {
                        cardType: 1,
                        cardTitle: "Inicio",
                        CardSubtitle: "No los botes dónalos",
                        IconsString: "solar:home-2-bold-duotone",
                        link: "#inicio",
                        path: "/"
                    },
                    {
                        cardType: 1,
                        cardTitle: "Nuestro Trabajo",
                        CardSubtitle: "Qué hacemos como CXUM",
                        IconsString: "solar:sledgehammer-bold-duotone",
                        link: "#NuestroTrabajo",
                        path: "/"
                    },
                    {
                        cardType: 1,
                        cardTitle: "Nuestro Impacto",
                        CardSubtitle: "Ve nuestras estadísticas",
                        IconsString: "solar:users-group-two-rounded-bold-duotone",
                        link: "#NuestroImpacto",
                        path: "/"
                    },
                ],
            },
            {
                cards: [
                    {
                        cardType: 1,
                        cardTitle: "¿Quiénes somos?",
                        CardSubtitle: "Conócenos",
                        IconsString: "solar:users-group-two-rounded-bold-duotone",
                        link: "#Quiénessomos",
                        path: "/"
                    },
                     {
                        cardType: 1,
                        cardTitle: "Nuestra Visión",
                        CardSubtitle: "Conoce nuestra historia",
                        IconsString: "solar:eye-bold-duotone",
                        link: "#MisionVision",
                        path: "/"
                    },
                    {
                        cardType: 1,
                        cardTitle: "Centros de Acopio",
                        CardSubtitle: "Centros donde puedes poner tu granito de arena",
                        IconsString: "solar:leaf-bold-duotone",
                        link: "#PuntosDeEntrega",
                        path: "/"
                    },
                ],
            },
            {
                cards: [
                    
                    {
                        cardType: 1,
                        cardTitle: "Nuestro Equipo",
                        CardSubtitle: "Los que hicieron esto posible",
                        IconsString: "solar:branching-paths-up-bold-duotone",
                        link: "#equipo",
                        path: "/"

                    },
                    {
                        cardType: 1,
                        cardTitle: "Noticias Recientes",
                        CardSubtitle: "Conoce nuestras últimas públicaciones",
                        IconsString: "solar:paperclip-rounded-bold-duotone",
                        link: "#NoticiasRecientes",
                        path: "/"

                    },
                ],
            },
        ],
    },
    {
        sections: [
            {
                cards: [
                    {
                        cardType: 1,
                        cardTitle: "Plataforma",
                        CardSubtitle: "",
                        IconsString: "ph:cube-duotone",
                        link: "#inicio",
                        path: "/"

                    },
                    {
                        cardType: 1,
                        cardTitle: "Voluntarios",
                        CardSubtitle: "",
                        IconsString: "solar:heart-pulse-bold-duotone",
                        link: "#inicio",
                        path: "/"

                    },
                ],
            },
           
        ],
    },
    {
       sections: [
        {
                cards: [
                    {
                        cardType: 2,
                        cardTitle: "Contáctanos",
                        CardSubtitle: "",
                        IconsString: "solar:phone-bold-duotone",
                        link: "#contacto",
                        path: "/Contacto"

                    },
                    {
                        cardType: 2,
                        cardTitle: "Nuestra Historia",
                        CardSubtitle: "",
                        IconsString: "lets-icons:time-duotone",
                        link: "#inicio",
                        path: "/"

                    },
                    {
                        cardType: 2,
                        cardTitle: "Noticias",
                        CardSubtitle: "",
                        IconsString: "solar:database-bold-duotone",
                        link: "#inicio",
                        path: "/"

                    }
                    

                ], 
        }
    ]
}
    
];
