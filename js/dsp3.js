
function loadScript(src, async = false) {
    return new Promise((res, rej) => {
        const firstElement = document.getElementsByTagName('head')[0] || document.documentElement,
            scriptElement = document.createElement('script');
        scriptElement.type = 'text/javascript';
        scriptElement.src = src;
        scriptElement.async = async;
        scriptElement.onload = res;
        scriptElement.onerror = rej;
        firstElement.insertBefore(scriptElement, firstElement.firstChild);
    });
}

// utils
const startTime = new Date().getTime();
const getRuntime = () => {
    return new Date().getTime() - startTime;
}

function observeVisibility(el, callback) {
    const observer = new IntersectionObserver(callback, {
        root: null, // viewport
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0] // every 10%
    });
    try {
        observer.observe(el);
    } catch (e) {
        console.log('IntersectionObserver setup failed', e);
    }
    return observer
}

function visible(intersectionRatio, threshold) {
    return intersectionRatio * 100 >= threshold
}

function createPlacement(adSlot, size = { width: 300, height: 250 }) {
    if(!adSlot && !size) {
        return null;
    }

    const placement = document.createElement('div');
    //placement.style.backgroundColor = 'green';
    placement.style.width = size.width + 'px';
    placement.style.height = size.height + 'px';
    placement.style.position = 'relative';
    //placement.style.border = '1px solid red';
    adSlot.prepend(placement);

    return placement
}

function createContainer(placement) {
    if(!placement) {
        return null;
    }
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.bottom = '0';
    container.style.left = '0';
    container.style.right = '0';
    container.style.textAlign = 'center';
    container.style.height = '0';
    placement.appendChild(container);

    return container;
}

const createSlot = (adUnitId, placement, container, sizes, conf) => {
    const slot = {
        adUnitId,
        placement,
        container,
        sizes,
        conf,
        adCycleActive: false,
        isFirstAdRequest: true,
        isEmpty: false,
        lastAdRequestRuntime: null,
        lastAdImpressionRuntime: null,
        lastAdErrorRuntime: null,
        visibilityThreshold: 50, // 50%
        visibilityDetector: null,
        numFailedAdRequests: 0,
        get visible() {
            if(this.visibilityDetector) {
                return this.visibilityDetector.visible;
            }
            return false;
        },
    };
    // Visibility Detector
    slot.visibilityDetector = new VisibilityDetector(slot.placement, slot.visibilityThreshold);

    return registerSlot(slot);
}

const slotsMap = new Map();
const registerSlot = (slot) => {
    slotsMap.set(slot.adUnitId, slot);
    return slot
}

const getRegisteredSlots = (adUnitId) => {
    if(adUnitId) {
        if(slotsMap.has(adUnitId)) {
            return slotsMap.get(adUnitId)
        }
        return null;
    }
    return slotsMap;
}

const isMobileView = () => {
    //return window.matchMedia('(width <= 728px)').matches;
    return window.innerWidth <= 728;
}

(function() {

    const adSlot1 = document.getElementById('ad-slot-1'); // 728x90
    const adSlot2 = document.getElementById('ad-slot-2'); // 728x90
    const adSlot3 = document.getElementById('ad-slot-2'); // 728x90

    let adSlot4 = null; // 320x50
    // sticky bottom
    const stickyBottom = document.createElement('div');
    stickyBottom.className = 'sticky-bottom';
    const stickyBottomAdSlot = document.createElement('div');
    stickyBottomAdSlot.id = 'ad-slot-4';
    stickyBottomAdSlot.style.display = 'inline-block';
    stickyBottom.appendChild(stickyBottomAdSlot);

    document.body.appendChild(stickyBottom);

    adSlot4 = stickyBottomAdSlot;

    // TODO:
    if(adSlot1) {

        loadScript('https://basil79.github.io/media/js/2.0.6/display-ads-manager.js')
            .then(() => {
                init();
            })
            .catch((e) => {

            });
    }

    function init() {

        console.log('here');

        // intervals

        const interval = 15000; // 15 sec
        const retryInterval = 5000; // 5 sec
        const smartInterval = 500;

        function getSmartInterval(numFailedAdRequests) {
            return Math.max(0, numFailedAdRequests - 1) * smartInterval;
        }

        // sizes 300x250
        const sizes1 = [
            {width: 300, height: 250}, //
            {width: 200, height: 200},
            {width: 300, height: 50},
            {width: 320, height: 50},
            {width: 250, height: 250}
        ];

        // sort sizes
        sizes1.sort((a, b) => {
            const aArea = a.width * a.height;
            const bArea = b.width * b.height;
            // compare the area of each
            return bArea - aArea;
        });

        // sizes 728x90
        const sizes2 = [
            {width: 468, height: 60},
            {width: 728, height: 90},
        ];

        // sort sizes
        sizes2.sort((a, b) => {
            const aArea = a.width * a.height;
            const bArea = b.width * b.height;
            // compare the area of each
            return bArea - aArea;
        });

        // TODO: 300x250
        const placement1 = createPlacement(adSlot1, isMobileView() ? { width: 300, height: 250 } : { width: 728, height: 90 });
        const container1 = createContainer(placement1);

        // TODO:
        createSlot('1', placement1, container1, isMobileView() ? sizes1 : sizes2, {
            data:[
                {
                    id:'7_1',
                    adServer: {
                        url:'/23313035219/test_display_ad_unit_3'
                    },
                    frequency:{
                        type:'REQUEST',
                        value:1,
                        minutes:0.5
                    },
                    cpm:0.1,
                    tier:3,
                    priority:0
                },
                {
                    id: '6_1',
                    adServer: {
                        url: '/21925505877/test_display_ad_unit_2'
                    },
                    frequency:{
                        type:'REQUEST',
                        value:1,
                        minutes:0.5
                    },
                    cpm: 0.1,
                    tier: 3,
                    priority:1
                },
            ]
        });


        if(adSlot2) {
            // TODO: 728x90
            const placement2 = createPlacement(adSlot2, isMobileView() ? {width: 300, height: 250} : {
                width: 728,
                height: 90
            });
            const container2 = createContainer(placement2);

            createSlot('2', placement2, container2, isMobileView() ? sizes1 : sizes2, {
                data: [
                    {
                        id: '7_2',
                        adServer: {
                            url: '/23313035219/test_display_ad_unit_top'
                        },
                        frequency: {
                            type: 'REQUEST',
                            value: 1,
                            minutes: 0.5
                        },
                        cpm: 0.1,
                        tier: 3,
                        priority: 0
                    },
                    {
                        id: '6_2',
                        adServer: {
                            url: '/21925505877/test_display_ad_unit_top'
                        },
                        frequency: {
                            type: 'REQUEST',
                            value: 1,
                            minutes: 0.5
                        },
                        cpm: 0.1,
                        tier: 3,
                        priority: 1
                    },
                ]
            });
        }

        if(adSlot3) {
            // TODO: 728x90
            const placement3 = createPlacement(adSlot3, isMobileView() ? {width: 300, height: 250} : {
                width: 728,
                height: 90
            });
            const container3 = createContainer(placement3);

            createSlot('3', placement3, container3, isMobileView() ? sizes1 : sizes2, {
                data: [
                    {
                        id: '7_3',
                        adServer: {
                            url: '/23313035219/test_display_ad_unit_top'
                        },
                        frequency: {
                            type: 'REQUEST',
                            value: 1,
                            minutes: 0.5
                        },
                        cpm: 0.1,
                        tier: 3,
                        priority: 0
                    },
                    {
                        id: '6_3',
                        adServer: {
                            url: '/21925505877/test_display_ad_unit_top'
                        },
                        frequency: {
                            type: 'REQUEST',
                            value: 1,
                            minutes: 0.5
                        },
                        cpm: 0.1,
                        tier: 3,
                        priority: 1
                    },
                ]
            });
        }

        // TODO: sticky bottom
        if(adSlot4) {

            const placement4 = createPlacement(adSlot4, isMobileView() ? { width: 320, height: 50 } :  { width: 728, height: 90});
            const container4 = createContainer(placement4);

            // sizes 300x250
            let sizes4 = [
                /*{width: 468, height: 60},*/
                {width: 728, height: 90},
                /*{width: 970, height: 250},
                {width: 930, height: 180},
                {width: 970, height: 90},
                {width: 980, height: 120}*/
            ];

            if(isMobileView()) {
                sizes4 = [
                    {width: 300, height: 50},
                    {width: 320, height: 50}
                ]
            }

            // sort sizes
            sizes4.sort((a, b) => {
                const aArea = a.width * a.height;
                const bArea = b.width * b.height;
                // compare the area of each
                return bArea - aArea;
            });

            createSlot('4', placement4, container4, sizes4, {
                data:[
                    /*
                    {
                      id: '4_4',
                      adServer: {
                        url: '/6355419/Travel/Europe/France/Paris'
                      },
                      frequency: {
                        type: 'REQUEST',
                        value: 1,
                        minutes: 0.5
                      },
                      cpm: 2.0,
                      tier: 1,
                      priority: 1,
                    },
                    {
                      id: '2_4',
                      bidder:{
                        code: 'onetag',
                        params: {
                          pubId: '386276e072'
                        }
                      },
                      floor:0.1,
                      tier:2,
                      priority:0
                    },
                     */
                    {
                        id:'7_4',
                        adServer: {
                            url:'/23313035219/test_display_ad_unit_sticky_bottom'
                        },
                        frequency:{
                            type:'REQUEST',
                            value:1,
                            minutes:0.5
                        },
                        cpm:0.1,
                        tier:3,
                        priority:0
                    },
                    {
                        id: '6_4',
                        adServer: {
                            url: '/21925505877/test_display_ad_unit_sticky_bottom'
                        },
                        frequency:{
                            type:'REQUEST',
                            value:1,
                            minutes:0.5
                        },
                        cpm: 0.1,
                        tier: 3,
                        priority:1
                    }
                ]
            });

        }

        // visibility checker
        let isVisibilityCheckerActive = false;
        function runVisibilityChecker() {
            if(!isVisibilityCheckerActive) {
                isVisibilityCheckerActive = true;
            } else return;

            const checkIfRequestAds = () => {

                const slots = getRegisteredSlots();
                for(const [key, value] of slots) {
                    const slotDef = value;

                    if(!slotDef.adCycleActive) {

                        // first ad request
                        if(slotDef.isFirstAdRequest
                            && slotDef.visible) {
                            slotDef.isFirstAdRequest = false;

                            requestAd(slotDef);
                        }

                        // if ad error
                        if(slotDef.isEmpty
                            && slotDef.visible
                            && slotDef.lastAdErrorRuntime
                            && slotDef.lastAdErrorRuntime >= slotDef.lastAdRequestRuntime
                            //&& getRuntime() - slotDef.lastAdErrorRuntime >= retryInterval) {
                            && getRuntime() - slotDef.lastAdErrorRuntime >= (retryInterval + getSmartInterval(slotDef.numFailedAdRequests))) {

                            requestAd(slotDef);

                        }

                        // if ad impression
                        if(!slotDef.isEmpty
                            && slotDef.visible
                            && slotDef.lastAdImpressionRuntime
                            && slotDef.lastAdImpressionRuntime >= slotDef.lastAdRequestRuntime
                            && getRuntime() - slotDef.lastAdImpressionRuntime >= interval) {

                            requestAd(slotDef);

                        }

                    }
                }

                // start timeout
                stopVisibilityCheckerTimeout();
                visibilityCheckerTimeoutId = setTimeout(() => {
                    checkIfRequestAds();
                }, 250); // 250 ms
            }

            checkIfRequestAds();
        }

        let visibilityCheckerTimeoutId = null;
        function stopVisibilityCheckerTimeout() {
            if(visibilityCheckerTimeoutId) {
                clearTimeout(visibilityCheckerTimeoutId);
                visibilityCheckerTimeoutId = null;
            }
        }


        const slot1 = getRegisteredSlots('1');
        const slot2 = getRegisteredSlots('2');
        const slot3 = getRegisteredSlots('3');
        const slot4 = getRegisteredSlots('4');


        const options = {
            // sessionId: null, // TODO:
            publisherId: '1987',
            widgetId: '0016M00002Tye8hQAB_M9942',
            closeButton: false,
            userIds: true,
            userIdsProviders: [{
                name: 'hadronId',
                partnerId: 454
            }],
            adjustFloors: { // adjust floors
                enabled: true, // default false
                decreasePercentage: 0.1, // default 0.1
                adjustModel: 'dynamic', // default dynamic - return-to-default-floor, keep-minimum, dynamic
                minFloor: 0.01, // default 0.1
            },
            gpid: true,
            gdpr: true, // GDPR
            usp: true, // USP
        };

        var displayAdsManager1;
        var displayAdsManager2;
        var displayAdsManager3;
        var displayAdsManager4;


        // declare
        displayAdsManager1 = new adserve.DisplayAdsManager(slot1.container, [], options, null, (error) => {
            if(error) {
                console.log(error);
                return;
            }

            console.log('DSP is ready');
            console.log('DSP version is', displayAdsManager1.getVersion());

            if(slot2) {
                load2()
            } else if(slot3) {
                load3();
            } else if(slot4) {
                load4();
            } else {
                // run visibility checker
                runVisibilityChecker();
            }

        });
        displayAdsManager1.addEventListener('AdImpression', () => {


            slot1.isEmpty = false;
            slot1.lastAdImpressionRuntime = getRuntime();
            slot1.numFailedAdRequests = 0;
            slot1.adCycleActive = false;

            console.log('AdImpression 1');

        });
        displayAdsManager1.addEventListener('AdError', (adError) => {

            slot1.isEmpty = true;
            slot1.lastAdErrorRuntime = getRuntime();
            slot1.numFailedAdRequests = slot1.numFailedAdRequests + 1;
            slot1.adCycleActive = false;

            console.log('AdError 1', adError);

        });
        displayAdsManager1.addEventListener('Demand.AdRequest', (tag) => {
            console.log('Demand.AdRequest', 'dti', tag.id, 'cpm', tag.cpm, 'tag', tag);
        });
        displayAdsManager1.addEventListener('Demand.AdImpression', (tag) => {
            console.log('Demand.AdImpression', 'dti', tag.id, 'cpm', tag.cpm, 'tag', tag);
        });



        function load2() {
            // TODO: test
            displayAdsManager2 = new adserve.DisplayAdsManager(slot2.container, [], options, null, (error) => {
                if(error) {
                    console.log(error);
                    return;
                }
                console.log('DSP 2 is ready');
                console.log('DSP 2 version is', displayAdsManager2.getVersion());

                if(slot4) {
                    load4();
                } else {
                    // run visibility checker
                    runVisibilityChecker();
                }

            });
            displayAdsManager2.addEventListener('AdImpression', () => {


                slot2.isEmpty = false;
                slot2.lastAdImpressionRuntime = getRuntime();
                slot2.numFailedAdRequests = 0;
                slot2.adCycleActive = false;

                console.log('AdImpression 2');

            });
            displayAdsManager2.addEventListener('AdError', (adError) => {

                slot2.isEmpty = true;
                slot2.lastAdErrorRuntime = getRuntime();
                slot2.numFailedAdRequests = slot2.numFailedAdRequests + 1;
                slot2.adCycleActive = false;

                console.log('AdError 2', adError);

            });
            displayAdsManager2.addEventListener('Demand.AdRequest', (tag) => {
                console.log('Demand.AdRequest 2', 'dti', tag.id, 'cpm', tag.cpm, 'tag', tag);
            });
            displayAdsManager2.addEventListener('Demand.AdImpression', (tag) => {
                console.log('Demand.AdImpression 2', 'dti', tag.id, 'cpm', tag.cpm, 'tag', tag);
            });
        }

        function load3() {
            // TODO: test
            displayAdsManager3 = new adserve.DisplayAdsManager(slot3.container, [], options, null, (error) => {
                if(error) {
                    console.log(error);
                    return;
                }
                console.log('DSP 3 is ready');
                console.log('DSP 3 version is', displayAdsManager3.getVersion());

                if(slot4) {
                    load4();
                } else {
                    // run visibility checker
                    runVisibilityChecker();
                }

            });
            displayAdsManager3.addEventListener('AdImpression', () => {


                slot3.isEmpty = false;
                slot3.lastAdImpressionRuntime = getRuntime();
                slot3.numFailedAdRequests = 0;
                slot3.adCycleActive = false;

                console.log('AdImpression 3');

            });
            displayAdsManager3.addEventListener('AdError', (adError) => {

                slot3.isEmpty = true;
                slot3.lastAdErrorRuntime = getRuntime();
                slot3.numFailedAdRequests = slot3.numFailedAdRequests + 1;
                slot3.adCycleActive = false;

                console.log('AdError 3', adError);

            });
            displayAdsManager3.addEventListener('Demand.AdRequest', (tag) => {
                console.log('Demand.AdRequest 3', 'dti', tag.id, 'cpm', tag.cpm, 'tag', tag);
            });
            displayAdsManager3.addEventListener('Demand.AdImpression', (tag) => {
                console.log('Demand.AdImpression 3', 'dti', tag.id, 'cpm', tag.cpm, 'tag', tag);
            });
        }

        function load4() {

            displayAdsManager4 = new adserve.DisplayAdsManager(slot4.container, [], options, null, (error) => {
                if (error) {
                    console.log(error);
                    return;
                }
                console.log('DSP 4 is ready');
                console.log('DSP 4 version is', displayAdsManager4.getVersion());

                // run visibility checker
                runVisibilityChecker();

            });
            displayAdsManager4.addEventListener('AdImpression', () => {

                slot4.isEmpty = false;
                slot4.lastAdImpressionRuntime = getRuntime();
                slot4.numFailedAdRequests = 0;
                slot4.adCycleActive = false;

                console.log('AdImpression 4');

            });
            displayAdsManager4.addEventListener('AdError', (adError) => {

                slot4.isEmpty = true;
                slot4.lastAdErrorRuntime = getRuntime();
                slot4.numFailedAdRequests = slot4.numFailedAdRequests + 1;
                slot4.adCycleActive = false;

                console.log('AdError 4', adError);

            });
            displayAdsManager4.addEventListener('Demand.AdRequest', (tag) => {
                console.log('Demand.AdRequest 4', 'dti', tag.id, 'cpm', tag.cpm, 'tag', tag);
            });
            displayAdsManager4.addEventListener('Demand.AdImpression', (tag) => {
                console.log('Demand.AdImpression 4', 'dti', tag.id, 'cpm', tag.cpm, 'tag', tag);
            });
        }

        function requestAd(slotDef) {

            slotDef.adCycleActive = true;
            slotDef.lastAdRequestRuntime = getRuntime();

            console.log('request ad >', slotDef.adUnitId, 'slot visible ?', slotDef.visible);

            // waterfall
            try {

                console.log(slotDef.conf);

                if(typeof slotDef.conf === 'object' && slotDef.conf.data) {
                    console.log('valid data');

                    if(slotDef.adUnitId == '1') {
                        // request ads
                        displayAdsManager1.requestAds(slotDef.conf.data, {
                            sizes: slotDef.sizes,
                            geo: 'US',
                            schain: '1.0,1!adserve.tv,001w000001flCw2AAE,1,,,'
                        });
                    }

                    if(slotDef.adUnitId == '2') {
                        // request ads
                        displayAdsManager2.requestAds(slotDef.conf.data, {
                            sizes: slotDef.sizes,
                            geo: 'US',
                            schain: '1.0,1!adserve.tv,001w000001flCw2AAE,1,,,'
                        });
                    }

                    if(slotDef.adUnitId == '3') {
                        // request ads
                        displayAdsManager3.requestAds(slotDef.conf.data, {
                            sizes: slotDef.sizes,
                            geo: 'US',
                            schain: '1.0,1!adserve.tv,001w000001flCw2AAE,1,,,'
                        });
                    }

                    if(slotDef.adUnitId == '4') {
                        // request ads
                        displayAdsManager4.requestAds(slotDef.conf.data, {
                            sizes: slotDef.sizes,
                            geo: 'US',
                            schain: '1.0,1!adserve.tv,001w000001flCw2AAE,1,,,'
                        });
                    }

                } else {
                    console.log('invalid data')
                }

            } catch(e) {
                console.log(e);
            }

        }


    }
})();

class VisibilityDetector {
    #el;
    #visibilityThreshold;
    #intersectionRatio = 0;
    #boundHandleVisibilityChange = this.#handleVisibilityChange.bind(this);
    constructor(el, visibilityThreshold) {
        if(el) {
            this.#el = el;
            this.#visibilityThreshold = visibilityThreshold || 50;

            // Observe
            observeVisibility(this.#el, (intersectionEntries) => {
                const { intersectionRatio } = intersectionEntries[intersectionEntries.length - 1];
                this.#intersectionRatio = intersectionRatio;
                this.#handleVisibilityChange();
            });

            document.addEventListener('visibilitychange', this.#boundHandleVisibilityChange);
        }
    }
    get visible() {
        if(document.hidden) {
            return false;
        }
        return visible(this.#intersectionRatio, this.#visibilityThreshold);
    }
    #handleVisibilityChange() {
        console.log('DSP > VD > visibility change', this.visible);
    }
}
