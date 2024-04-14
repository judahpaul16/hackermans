import Phaser from 'phaser';
import WebFontLoader from 'webfontloader';

// Extending Phaser.Loader.File with TypeScript requires typing for constructor parameters and class properties.
export default class WebFontFile extends Phaser.Loader.File {
    private fontNames: string[];
    private service: string;

    /**
     * Creates an instance of WebFontFile.
     * 
     * @param {Phaser.Loader.LoaderPlugin} loader The loader plugin used to load the file.
     * @param {string | string[]} fontNames The name(s) of the font(s) to load.
     * @param {string} [service='google'] The font hosting service (default is 'google').
     */
    constructor(loader: Phaser.Loader.LoaderPlugin, fontNames: string | string[], service: string = 'google') {
        super(loader, {
            type: 'webfont',
            key: fontNames.toString(),
        });

        this.fontNames = Array.isArray(fontNames) ? fontNames : [fontNames];
        this.service = service;
    }

    // The load method does not explicitly return a value, so its return type is void.
    public load(): void {
        const config: { active: () => void; google?: { families: string[] } } = {
            active: () => {
                this.loader.nextFile(this, true);
            },
        };

        if (this.service === 'google') {
            config.google = {
                families: this.fontNames,
            };
        } else {
            throw new Error('Unsupported font service');
        }

        WebFontLoader.load(config);
    }
}
