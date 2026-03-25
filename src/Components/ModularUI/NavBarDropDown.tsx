import { AnimatePresence, motion } from "framer-motion"
import Iconify from "./IconsMock"
import { InfoCards } from "../../types/NavBarLinks"

interface glassStyles{
    container: string
    container2: string
    text: string
    themeBtn: string
}

interface DropDownProps{
    show: boolean
    cardWidth: number
    setFlag: (h: boolean)=> void
    activeIndex: number | null
    contentRef: (instance: HTMLDivElement | null) => void
    glassStyles: glassStyles

}

interface VariantCard1{
    glassStyles: glassStyles
    title: string
    subTitle?: string
    IconString?: string
}

export default function NavBarDropDown({show, cardWidth, setFlag, contentRef, activeIndex, glassStyles }: DropDownProps){
    return (
        <AnimatePresence>
      {show && (
        <motion.div
          key="dropdown"
          initial={{ opacity: 0, y: 8 }}
          animate={{ 
            opacity: 1, 
            y: 20,
            width: cardWidth > 0 ? cardWidth : "auto"
          }}
          exit={{ opacity: 0, y: 8 }}
          transition={{
            opacity: { duration: 0.3, ease: "easeOut" },
            y:       { duration: 0.3, ease: "easeOut" },
            width:   { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
          }}
          onHoverStart={() => setFlag(true)}
          onHoverEnd={() => setFlag(false)}
          className={`relative pointer-events-auto overflow-hidden rounded-4xl border ${glassStyles.container2}`}
        >
          <div ref={contentRef} style={{ display: "flex", width: "max-content" }}>
            <AnimatePresence mode="wait">
                {InfoCards.map((n, i) => {
                    if (activeIndex !== i) return null; 

                    return (
                    <motion.div
                        key={`card-${i}`}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="flex"
                    >
                        {n.sections.map((h, l) => (
                        <div key={l} className="w-auto flex-col p-5">
                            {h.cards.map((m, q) => (
                            <div key={q}>
                                {m.cardType === 1 && (
                                <CardVariant1
                                    title={m.cardTitle}
                                    subTitle={m.CardSubtitle}
                                    IconString={m.IconsString}
                                    glassStyles={glassStyles}
                                />
                                )}
                                {m.cardType === 2 && <></>}
                                {m.cardType === 3 && <></>}
                            </div>
                            ))}
                        </div>
                        ))}
                    </motion.div>
                    );
                })}
                </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    )
}


function CardVariant1({title, subTitle, glassStyles, IconString} : VariantCard1){
    return(
        <motion.div className={`flex p-2 px-6 py-6 rounded-3xl items-center flex-row hover:bg-gray-500/20 transition-all duration-500 cursor-pointer ${glassStyles.text}`}>
            <Iconify IconString={IconString || ""} Size={32} Style={{ marginTop: 2 }} />
                <div className="flex flex-col ml-2">
                    <h1 className="text-[1.5rem] font-bold -mb-1">{title}</h1>
                    <p className="text-[0.92rem] relative z-10 max-w-md text-base leading-relaxed">
                          {subTitle}
                    </p>
                </div>
        </motion.div>
    )
}