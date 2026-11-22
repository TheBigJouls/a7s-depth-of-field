import { useState, useMemo } from "react";
import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Box,
  Flex,
  Text,
  Select,
  Button,
  Radio,
  Stack,
  RadioGroup,
  Icon,
  Wrap,
  WrapItem,
  Divider,
  SimpleGrid,
  Badge,
  IconButton,
  useColorMode,
  useColorModeValue,
  Tooltip,
  Checkbox,
} from "@chakra-ui/react";
import { TbRuler, TbAperture, TbZoomIn, TbUser } from "react-icons/tb";
import { FiGithub, FiCamera, FiSun, FiMoon } from "react-icons/fi";
import { toImperial, toMetric } from "./utils/units";
import { buildNativeSelectStyles } from "./selectStyles";
import {
  BRANDS,
  CAMERAS,
  lensesForCamera,
  maxApertureAt,
  logProfilesFor,
  FF,
  S35,
  FF_CROP_11,
  DEFAULT_CAMERA_ID,
  DEFAULT_LENS_ID,
} from "./gear";
import { DICT, LANGUAGES, fill, loadLang, saveLang, type Lang } from "./i18n";

import PhotographyGraphic, { SUBJECTS } from "./PhotographyGraphic";
import MonitorView from "./MonitorView";
import {
  SCENES,
  SHUTTER_SPEEDS,
  ISOS,
  WB_MODES,
  type WbMode,
  formatShutter,
  cameraEV,
  correctShutter,
  nearestShutter,
  whiteBalanceKelvin,
  colorCast,
  VIDEO_SYSTEMS,
  type VideoSystem,
  videoShutters,
  shutter180,
  isFlickerSafe,
  autoIso,
  ND_FILTERS,
  CPL_LOSS,
  pickNd,
  nearestIso,
} from "./lighting";

import Telephoto from "./assets/100-400.png";
import Fisheye from "./assets/fishey.png";

// Modes capteur des A7S II / A7S III (capteur 35,6 × 23,8 mm, 12 Mpx)
const CIRCLES_OF_CONFUSION: Record<
  string,
  { coc: number; sensorHeight: number; cropFactor: number }
> = {
  [FF]: { coc: 0.029, sensorHeight: 23.8, cropFactor: 1.0 },
  [FF_CROP_11]: { coc: 0.026, sensorHeight: 21.6, cropFactor: 1.1 },
  [S35]: { coc: 0.019, sensorHeight: 15.9, cropFactor: 1.5 },
};

// Préréglages : boîtier + objectif + réglages typiques (distance en pouces)
const COMMON_SETUPS: {
  name: string;
  cameraId: string;
  lensId: string;
  focalLength: number;
  aperture: number;
  idealDistance: number;
  sensor: string;
}[] = [
  { name: "24-105 @ 24 mm f/4 – plan large", cameraId: "sony-a7siii", lensId: "E:Sony:FE 24-105mm F4 G OSS", focalLength: 24, aperture: 4, idealDistance: 118, sensor: FF },
  { name: "24-105 @ 50 mm f/4 – interview", cameraId: "sony-a7siii", lensId: "E:Sony:FE 24-105mm F4 G OSS", focalLength: 50, aperture: 4, idealDistance: 79, sensor: FF },
  { name: "24-105 @ 105 mm f/4 – portrait serré", cameraId: "sony-a7siii", lensId: "E:Sony:FE 24-105mm F4 G OSS", focalLength: 105, aperture: 4, idealDistance: 138, sensor: FF },
  { name: "A7S II + EF 24-105 f/4L (adapté)", cameraId: "sony-a7sii", lensId: "EF:Canon EF (adapté):EF 24-105mm f/4L IS II USM", focalLength: 70, aperture: 4, idealDistance: 98, sensor: FF },
  { name: "35 mm f/1.4 – vlog / gimbal", cameraId: "sony-a7siii", lensId: "E:Sony:FE 35mm F1.4 GM", focalLength: 35, aperture: 1.4, idealDistance: 47, sensor: FF },
  { name: "50 mm f/1.8 – interview bokeh", cameraId: "sony-a7siii", lensId: "E:Sony:FE 50mm F1.8", focalLength: 50, aperture: 1.8, idealDistance: 79, sensor: FF },
  { name: "85 mm f/1.8 – portrait", cameraId: "sony-a7siii", lensId: "E:Sony:FE 85mm F1.8", focalLength: 85, aperture: 1.8, idealDistance: 118, sensor: FF },
  { name: "24-70 GM II @ 70 f/2.8", cameraId: "sony-a7siii", lensId: "E:Sony:FE 24-70mm F2.8 GM II", focalLength: 70, aperture: 2.8, idealDistance: 98, sensor: FF },
  { name: "A7S II Super 35 + Sigma 18-35 f/1.8", cameraId: "sony-a7sii", lensId: "E-APSC:Sigma APS-C:18-35mm F1.8 DC HSM Art (EF adapté)", focalLength: 24, aperture: 1.8, idealDistance: 59, sensor: S35 },
  { name: "A7S III 4K 120p (×1.1) + 24-105", cameraId: "sony-a7siii", lensId: "E:Sony:FE 24-105mm F4 G OSS", focalLength: 35, aperture: 4, idealDistance: 79, sensor: FF_CROP_11 },
];

// URL du dépôt GitHub déduite de l'adresse GitHub Pages (utilisateur.github.io/depot)
const REPO_URL = (() => {
  try {
    const host = window.location.hostname;
    const m = host.match(/^([^.]+)\.github\.io$/);
    const repo = window.location.pathname.split("/").filter(Boolean)[0];
    if (m && repo) return `https://github.com/${m[1]}/${repo}`;
  } catch {
    /* noop */
  }
  return "https://github.com/jherr/depth-of-field";
})();

const SYSTEMS = ["Metric", "Imperial"] as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function App() {
  const [distanceToSubjectInInches, setDistanceToSubjectInInches] =
    useState(79);
  const [focalLengthInMillimeters, setFocalLengthInMillimeters] = useState(50);
  const [aperture, setAperture] = useState(4);
  const [subject, setSubject] = useState("Human");
  const [system, setSystem] = useState<(typeof SYSTEMS)[number]>("Metric");
  const [sensor, setSensor] = useState(FF);
  const [customSensorWidth, setCustomSensorWidth] = useState(36);
const [customSensorHeight, setCustomSensorHeight] = useState(24);

  const { colorMode, toggleColorMode } = useColorMode();
  const [lang, setLangState] = useState<Lang>(loadLang);
  const t = DICT[lang];
  const setLang = (l: Lang) => {
    setLangState(l);
    saveLang(l);
    document.documentElement.lang = l;
  };
  const sensorName = (k: string) => t.sensors[k] ?? k;

  const [cameraId, setCameraId] = useState(DEFAULT_CAMERA_ID);
  const [lensId, setLensId] = useState(DEFAULT_LENS_ID);
  const camera = CAMERAS.find((c) => c.id === cameraId);
  const cameraLenses = lensesForCamera(camera);
  const lens = cameraLenses.find((l) => l.id === lensId);
  const isPrime = !!lens && lens.minFocal === lens.maxFocal;
  const focalMin = lens && !isPrime ? lens.minFocal : 10;
  const focalMax = lens && !isPrime ? lens.maxFocal : 600;
  const apertureMin = lens ? maxApertureAt(lens, focalLengthInMillimeters) : 1.2;

  const sensorModes = camera ? camera.sensorModes : [FF, S35];
  const selectCamera = (id: string) => {
    setCameraId(id);
    setLensId("");
    const cam = CAMERAS.find((c) => c.id === id);
    if (!cam) return;
    // conserve l'objectif s'il existe sur l'autre boîtier
    const same = lensesForCamera(cam).find((l) => l.id === lensId);
    if (same) setLensId(same.id);
    setSensor((sn) => (cam.sensorModes.includes(sn) ? sn : cam.sensor));
  };
  const applyLens = (l: (typeof cameraLenses)[number]) => {
    setLensId(l.id);
    if (l.sensor) setSensor(l.sensor);
    else if (lens?.sensor) setSensor(FF);
    const f = clamp(focalLengthInMillimeters, l.minFocal, l.maxFocal);
    setFocalLengthInMillimeters(f);
    if (l.fixedAperture) setAperture(maxApertureAt(l, f));
    else setAperture((a) => Math.max(a, maxApertureAt(l, f)));
  };
  const selectLens = (id: string) => {
    const l = cameraLenses.find((x) => x.id === id);
    if (!l) {
      setLensId("");
      return;
    }
    applyLens(l);
  };
  const focalMarks = (() => {
    const std = [14, 24, 35, 50, 70, 85, 105, 135, 200, 300, 400, 600];
    if (!lens || isPrime) return std;
    const gap = (focalMax - focalMin) / 10;
    const inner = std.filter(
      (v) => v > focalMin + gap && v < focalMax - gap
    );
    return [focalMin, ...inner, focalMax];
  })();
  const changeFocal = (f: number) => {
    setFocalLengthInMillimeters(f);
    if (lens) setAperture((a) => Math.max(a, maxApertureAt(lens, f)));
  };
  const subjectName = (k: string) => t.subjects[k] ?? k;

  const convertUnits = system === "Imperial" ? toImperial : toMetric;

  const distanceToSubjectInMM = distanceToSubjectInInches * 25.4;

  const isCustomSensor = sensor === "Custom";
const customCocCalculated = Math.sqrt(customSensorWidth ** 2 + customSensorHeight ** 2) / 1500;
const circleOfConfusionInMillimeters = isCustomSensor
  ? customCocCalculated
  : CIRCLES_OF_CONFUSION[sensor].coc;
const cropFactor = isCustomSensor
  ? 43.27 / Math.sqrt(customSensorWidth ** 2 + customSensorHeight ** 2)
  : CIRCLES_OF_CONFUSION[sensor].cropFactor;

  const hyperFocalDistanceInMM =
    focalLengthInMillimeters +
    (focalLengthInMillimeters * focalLengthInMillimeters) /
      (aperture * circleOfConfusionInMillimeters);
  const depthOfFieldFarLimitInMM =
    (hyperFocalDistanceInMM * distanceToSubjectInMM) /
    (hyperFocalDistanceInMM -
      (distanceToSubjectInMM - focalLengthInMillimeters));
  const depthOfFieldNearLimitInMM =
    (hyperFocalDistanceInMM * distanceToSubjectInMM) /
    (hyperFocalDistanceInMM +
      (distanceToSubjectInMM - focalLengthInMillimeters));

  const farDistanceInInches = 360;
  const nearFocalPointInInches = clamp(
    depthOfFieldNearLimitInMM / 25.4,
    0,
    farDistanceInInches
  );
  let farFocalPointInInches = clamp(
    depthOfFieldFarLimitInMM / 25.4,
    0,
    farDistanceInInches
  );
  if (farFocalPointInInches < nearFocalPointInInches) {
    farFocalPointInInches = farDistanceInInches;
  }

  const sensorHeight = isCustomSensor
  ? customSensorHeight
  : CIRCLES_OF_CONFUSION[sensor].sensorHeight;
  const verticalFieldOfView =
    (2 * Math.atan(sensorHeight / 2 / focalLengthInMillimeters) * 180) /
    Math.PI;

  // ── Derived photography values
  const hyperFocalDistanceInInches = hyperFocalDistanceInMM / 25.4;
  const isInfinityFar =
    depthOfFieldFarLimitInMM / 25.4 > farDistanceInInches ||
    depthOfFieldFarLimitInMM <= 0;
  const totalDofInches = farFocalPointInInches - nearFocalPointInInches;
  const canSetHyperfocal = hyperFocalDistanceInInches <= farDistanceInInches;

  // 35mm equivalent focal length (only relevant when not on full frame)
  const equivalentFocalLength = Math.round(
    focalLengthInMillimeters * cropFactor
  );

  // Diffraction: airy disk (0.001342 × N mm) should not exceed CoC
  const diffractionLimitFStop =
    circleOfConfusionInMillimeters / 0.001342;
  const hasDiffractionRisk = aperture > diffractionLimitFStop;

  // DoF use-case character based on total depth
  const totalDofFeet = totalDofInches / 12;
  const dofCharacter =
    totalDofFeet < 0.5
      ? { label: t.categories.macro, color: "purple" }
      : totalDofFeet < 3
      ? { label: t.categories.portrait, color: "blue" }
      : totalDofFeet < 10
      ? { label: t.categories.group, color: "teal" }
      : totalDofFeet < 30
      ? { label: t.categories.street, color: "green" }
      : { label: t.categories.landscape, color: "gray" };

  // ── Light & exposure
  const [sceneId, setSceneId] = useState("golden");
  const scene = SCENES.find((x) => x.id === sceneId) ?? SCENES[0];
  const [lightBoost, setLightBoost] = useState(0);
  const [lightK, setLightK] = useState(scene.kelvin);
  const [expMode, setExpMode] = useState<"M" | "A">("M");
  const [shutterM, setShutterM] = useState(1 / 500);
  const [iso, setIso] = useState(100);
  const [wbMode, setWbMode] = useState<WbMode>("auto");
  const [wbManualK, setWbManualK] = useState(5500);
  const [shootMode, setShootMode] = useState<"photo" | "video">("video");
  const [vSystem, setVSystem] = useState<VideoSystem>("PAL");
  const [fps, setFps] = useState(25);
  const [vShutter, setVShutter] = useState(1 / 50);
  const [isoAuto, setIsoAuto] = useState(true);
  const isVideo = shootMode === "video";
  const [ndId, setNdId] = useState("ND8");
  const [vndStops, setVndStops] = useState(3);
  const [cplOn, setCplOn] = useState(false);
  const [cplRot, setCplRot] = useState(90);
  const [uvOn, setUvOn] = useState(false);
  const ndFilter = ND_FILTERS.find((n) => n.id === ndId) ?? ND_FILTERS[0];
  const ndStops = ndId === "vnd" ? vndStops : ndFilter.stops;
  const filterStops = ndStops + (cplOn ? CPL_LOSS : 0);
  const cplEffect = cplOn ? Math.pow(Math.sin((cplRot * Math.PI) / 180), 2) : 0;
  const filterTag = [
    ndId === "vnd" ? `VND ${vndStops}` : ndId !== "none" ? ndFilter.label : "",
    cplOn ? "CPL" : "",
    uvOn ? "UV" : "",
  ].filter(Boolean).join(" · ");
  const sceneEV = scene.ev + lightBoost - filterStops;
  const [profileId, setProfileId] = useState("standard");
  const [lutPreview, setLutPreview] = useState(false);
  const logProfiles = logProfilesFor(camera);
  const logProfile = logProfiles.find((p) => p.id === profileId);
  const isLog = !!logProfile;
  const minIso = logProfile ? logProfile.minIso : camera?.isoMin ?? 100;
  const maxIso = camera?.isoMax ?? 409600;
  const shutter = isVideo
    ? vShutter
    : expMode === "A"
    ? clamp(correctShutter(sceneEV, aperture, iso), 1 / 8000, 30)
    : shutterM;
  const autoIsoResult = autoIso(sceneEV, aperture, shutter, minIso);
  const useAutoIso = isVideo && isoAuto;
  const effIso = useAutoIso ? autoIsoResult.iso : Math.max(iso, minIso);
  const isoLabel = useAutoIso ? `AUTO ${autoIsoResult.display}` : String(iso);
  const exposureDelta = sceneEV - cameraEV(aperture, shutter, effIso);
  const mainsHz = VIDEO_SYSTEMS[vSystem].mainsHz;
  const flickerRisk =
    isVideo && scene.palette.indoor && !isFlickerSafe(shutter, mainsHz);
  const ideal180 = shutter180(vSystem, fps);
  const autoExposeNow = () => {
    // light available before any ND (CPL stays as chosen)
    const baseEV = scene.ev + lightBoost - (cplOn ? CPL_LOSS : 0);
    if (isVideo) {
      const over = baseEV - cameraEV(aperture, shutter, 100);
      const nd = pickNd(over);
      setNdId(nd.id);
      if (!isoAuto) setIso(nearestIso(100 * Math.pow(2, nd.stops - over), minIso));
      return;
    }
    let ev = baseEV - (ndId === "vnd" ? vndStops : ndFilter.stops);
    let t = correctShutter(ev, aperture, iso);
    if (t < 1 / 8000) {
      const nd = pickNd(Math.log2(1 / 8000 / t) + ndStops);
      setNdId(nd.id);
      ev = baseEV - nd.stops;
      t = correctShutter(ev, aperture, iso);
    }
    setShutterM(nearestShutter(t));
  };
  const changeVideo = (sys: VideoSystem, rate: number) => {
    setVSystem(sys);
    setFps(rate);
    setVShutter(shutter180(sys, rate));
  };
  const wbK = whiteBalanceKelvin(wbMode, lightK, wbManualK);
  const cast = colorCast(lightK, wbK);
  const grain = Math.min(
    0.45,
    Math.max(0, Math.log2(effIso / 100)) * 0.045 * Math.sqrt(cropFactor)
  );
  const shakeLimit = Math.round(focalLengthInMillimeters * cropFactor);
  const hasShakeRisk = !isVideo && shutter > 1 / shakeLimit;
  const selectScene = (id: string) => {
    setSceneId(id);
    const sc = SCENES.find((x) => x.id === id);
    if (sc) setLightK(sc.kelvin);
    setLightBoost(0);
  };

  // ── Theme-aware colors 
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const topBarBg = useColorModeValue("gray.50", "gray.900");
  const graphicTextColor = useColorModeValue("#1A202C", "#F7FAFC");
  const nativeSelectStyles = buildNativeSelectStyles(colorMode);

  const labelStyles = {
    mt: "2",
    ml: "-2.5",
    fontSize: "sm",
  };

  const distanceMarks = useMemo(() => {
    if (system === "Imperial") {
      return new Array(Math.floor(farDistanceInInches / 24) + 1)
        .fill(0)
        .map((_v, i) => (i + 1) * 24)
        .map((val) => ({
          value: val,
          label: `${val / 12}'`,
        }));
    } else {
      const farDistanceInMeters = farDistanceInInches * 0.0254;
      const convertMetersToInches = (meters: number) => meters * 39.3701;
      return new Array(Math.floor(farDistanceInMeters) + 1)
        .fill(0)
        .map((_val, val) => ({
          value: convertMetersToInches(val + 1),
          label: `${val + 1}m`,
        }));
    }
  }, [system, farDistanceInInches]);

  return (
    <>
      <Flex
        bg={topBarBg}
        justify="flex-end"
        align="center"
        gap={2}
        px={4}
        py={2}
        borderBottom="1px"
        borderColor={borderColor}
      >
        <Text as="h1" fontWeight="bold" fontSize={{ base: "sm", md: "md" }} mr="auto">
          Profondeur de champ · Sony A7S II / A7S III
        </Text>
        <Select
          aria-label={t.language}
          size="sm"
          width="auto"
          value={lang}
          onChange={(e) => setLang(e.target.value as Lang)}
          bg={nativeSelectStyles.bg}
          color={nativeSelectStyles.color}
          borderColor={nativeSelectStyles.borderColor}
          iconColor={nativeSelectStyles.iconColor}
          sx={nativeSelectStyles.sx}
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </Select>
        <Tooltip
          label={colorMode === "dark" ? t.lightMode : t.darkMode}
        >
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === "dark" ? <FiSun /> : <FiMoon />}
            size="sm"
            variant="ghost"
            onClick={toggleColorMode}
          />
        </Tooltip>
      </Flex>

      <Flex direction={{ base: "column", lg: "row" }} align="flex-start">
      <Box flex="1" minW={0} w="100%">
      <Box p={2} pt={4}>
        <PhotographyGraphic
          distanceToSubjectInInches={distanceToSubjectInInches}
          nearFocalPointInInches={nearFocalPointInInches}
          farFocalPointInInches={farFocalPointInInches}
          farDistanceInInches={farDistanceInInches}
          subject={subject as keyof typeof SUBJECTS}
          focalLength={focalLengthInMillimeters}
          aperture={aperture}
          system={system}
          verticalFieldOfView={verticalFieldOfView}
          textColor={graphicTextColor}
          onChangeDistance={(val) => setDistanceToSubjectInInches(val)}
        />
      </Box>

      {/* ── DoF Stats Panel ── */}
      <Box px={6} pt={2}>
        <SimpleGrid columns={4} spacing={3}>
          {[
            {
              label: t.near,
              value: convertUnits(nearFocalPointInInches, 0),
            },
            {
              label: t.far,
              value: isInfinityFar
                ? "∞"
                : convertUnits(farFocalPointInInches, 0),
            },
            {
              label: t.total,
              value: isInfinityFar ? "∞" : convertUnits(totalDofInches, 0),
            },
            {
              label: t.hyperfocal,
              value: convertUnits(hyperFocalDistanceInInches, 0),
            },
          ].map(({ label, value }) => (
            <Box
              key={label}
              bg={cardBg}
              rounded="lg"
              p={3}
              textAlign="center"
              border="1px"
              borderColor={borderColor}
            >
              <Text
                fontSize="xs"
                color={mutedText}
                textTransform="uppercase"
                letterSpacing="wide"
              >
                {label}
              </Text>
              <Text fontSize="lg" fontWeight="bold" mt={1}>
                {value}
              </Text>
            </Box>
          ))}
        </SimpleGrid>

        {/* DoF character badge + Set Hyperfocal action */}
        <Flex justify="space-between" align="center" mt={3}>
          <Badge
            colorScheme={dofCharacter.color}
            px={3}
            py={1}
            rounded="full"
            fontSize="sm"
          >
            {dofCharacter.label}
          </Badge>
          <Tooltip
            label={
              canSetHyperfocal
                ? t.hyperTipOk
                : fill(t.hyperTipFar, convertUnits(hyperFocalDistanceInInches, 0))
            }
          >
            <Button
              size="xs"
              variant="outline"
              colorScheme="teal"
              isDisabled={!canSetHyperfocal}
              onClick={() =>
                setDistanceToSubjectInInches(
                  Math.round(hyperFocalDistanceInInches)
                )
              }
            >
              {t.setHyperfocal}
            </Button>
          </Tooltip>
        </Flex>
      </Box>

      {/* ── Controls ── */}
      <Box px={6}>
        <Box pt={4}>
          <Flex gap={2} align="center">
            <Flex w="20%" justify="flex-end" align="center" gap={1.5}>
              <Icon as={TbRuler} boxSize={4} color={mutedText} />
              <Text fontSize="sm">{t.units}</Text>
            </Flex>
            <Box flexGrow={1}>
              <RadioGroup
                onChange={(v) => setSystem(v as "Imperial" | "Metric")}
                value={system}
              >
                <Stack direction="row">
                  {SYSTEMS.map((s) => (
                    <Radio value={s} key={s} colorScheme="blue">
                      {t[s]}
                    </Radio>
                  ))}
                </Stack>
              </RadioGroup>
            </Box>
          </Flex>
        </Box>

        {/* Camera + Lens */}
        <Box pt={6}>
          <Flex gap={3} direction={{ base: "column", md: "row" }}>
            <Flex gap={2} width={{ base: "100%", md: "50%" }}>
              <Flex w={{ base: "72px", md: "20%" }} mt={2} justify="flex-end" align="center" gap={1.5} flexShrink={0}>
                <Icon as={FiCamera} boxSize={4} color={mutedText} />
                <Text fontSize="sm" textAlign="right">{t.camera}</Text>
              </Flex>
              <Box flexGrow={1}>
                <Select
                  bg={nativeSelectStyles.bg}
                  color={nativeSelectStyles.color}
                  borderColor={nativeSelectStyles.borderColor}
                  iconColor={nativeSelectStyles.iconColor}
                  _hover={nativeSelectStyles._hover}
                  _focus={nativeSelectStyles._focus}
                  _active={nativeSelectStyles._active}
                  sx={nativeSelectStyles.sx}
                  aria-label={t.camera}
                  value={cameraId}
                  onChange={(e) => selectCamera(e.target.value)}
                >
                  {BRANDS.map((b) => (
                    <optgroup key={b} label={b}>
                      {CAMERAS.filter((c) => c.brand === b).map((c) => (
                        <option key={c.id} value={c.id}>
                          {b} {c.model}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </Select>
              </Box>
            </Flex>
            <Flex gap={2} width={{ base: "100%", md: "50%" }}>
              <Flex w={{ base: "72px", md: "20%" }} mt={2} justify="flex-end" align="center" gap={1.5} flexShrink={0}>
                <Icon as={TbAperture} boxSize={4} color={mutedText} />
                <Text fontSize="sm" textAlign="right">{t.lens}</Text>
              </Flex>
              <Box flexGrow={1}>
                <Select
                  bg={nativeSelectStyles.bg}
                  color={nativeSelectStyles.color}
                  borderColor={nativeSelectStyles.borderColor}
                  iconColor={nativeSelectStyles.iconColor}
                  _hover={nativeSelectStyles._hover}
                  _focus={nativeSelectStyles._focus}
                  _active={nativeSelectStyles._active}
                  sx={nativeSelectStyles.sx}
                  aria-label={t.lens}
                  value={lensId}
                  isDisabled={!camera}
                  onChange={(e) => selectLens(e.target.value)}
                >
                  {!camera?.fixedLens && <option value="">— {t.manual} —</option>}
                  {Array.from(new Set(cameraLenses.map((l) => l.maker))).map((maker) => (
                    <optgroup key={maker} label={maker}>
                      {cameraLenses.filter((l) => l.maker === maker).map((l) => (
                        <option key={l.id} value={l.id}>
                          {maker} {l.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </Select>
              </Box>
            </Flex>
          </Flex>
          {lens && (
            <Flex mt={2} justify="flex-start" pl={{ base: "80px", md: "calc(10% + 8px)" }}>
              <Badge colorScheme="blue" variant="subtle" px={2} py={0.5} fontSize="xs" rounded="md" textTransform="none">
                {lens.maker} · {isPrime ? `${lens.minFocal} mm` : `${lens.minFocal}–${lens.maxFocal} mm`} ·{" "}
                {lens.apertureWide === lens.apertureTele ? `f/${lens.apertureWide}` : `f/${lens.apertureWide}–${lens.apertureTele}`}
                {camera ? ` · ${camera.brand} ${camera.model}` : ""}
              </Badge>
            </Flex>
          )}
        </Box>

        {/* Subject Distance */}
        <Box pt={6}>
          <Flex gap={2} align="center">
            <Flex w="20%" justify="flex-end" align="center" gap={1.5} direction="column">
              <Flex align="center" gap={1.5}>
                <Icon as={TbRuler} boxSize={4} color={mutedText} />
                <Text fontSize="sm" textAlign="right">
                  {t.distance} ({system === "Imperial" ? "ft" : "m"})
                </Text>
              </Flex>
              <Text display={{ base: "block", xl: "none" }} fontSize="xs" color={mutedText}>
                {convertUnits(distanceToSubjectInInches, 1)}
              </Text>
            </Flex>
            <Box flexGrow={1}>
              <Slider
                aria-label="distance to subject"
                colorScheme="blue"
                value={distanceToSubjectInInches}
                onChange={(val: number) => setDistanceToSubjectInInches(val)}
                min={10}
                max={400}
                step={1}
              >
                {distanceMarks.map(({ label, value }) => (
                  <SliderMark key={value} value={value} {...labelStyles}>
                    {label}
                  </SliderMark>
                ))}
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>
          </Flex>
        </Box>

        {/* Focal Length */}
        <Box pt={6}>
          <Flex gap={2} align="center">
            <Flex w="20%" justify="flex-end" align="center" gap={1.5} direction="column">
              <Flex align="center" gap={1.5}>
                <Icon as={TbZoomIn} boxSize={4} color={mutedText} />
                <Text fontSize="sm" textAlign="right">
                  {t.focalLength} (mm)
                </Text>
              </Flex>
              <Text display={{ base: "block", xl: "none" }} fontSize="xs" color={mutedText}>
                {Math.round(focalLengthInMillimeters)} mm
              </Text>
            </Flex>
            <Box flexGrow={1}>
              <Slider
                aria-label="focal length"
                colorScheme="blue"
                value={focalLengthInMillimeters}
                onChange={(val: number) => changeFocal(val)}
                min={focalMin}
                max={focalMax}
                isDisabled={isPrime}
                step={1}
              >
                {focalMarks
                  .map((val) => (
                  <SliderMark key={val} value={val} {...labelStyles}>
                    {val}
                  </SliderMark>
                ))}
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>
          </Flex>
          <Flex gap={2} mt={2}>
            <Box w="20%"></Box>
            <Box flexGrow={1}>
              <Flex justify="space-between" align="center">
                <img src={Fisheye} alt="Fisheye lens" style={{ height: 50 }} />
                {sensor !== FF && (
                  <Text fontSize="xs" color={mutedText}>
                    {fill(t.fullFrameEq, equivalentFocalLength)}
                  </Text>
                )}
                <img
                  src={Telephoto}
                  alt="100-400 lens"
                  style={{ height: 50 }}
                />
              </Flex>
            </Box>
          </Flex>
        </Box>

        {/* Aperture */}
        <Box pt={6}>
          <Flex gap={2} align="center">
            <Flex w="20%" justify="flex-end" align="center" gap={1.5} direction="column">
              <Flex align="center" gap={1.5}>
                <Icon as={TbAperture} boxSize={4} color={mutedText} />
                <Text fontSize="sm">{t.aperture}</Text>
              </Flex>
              <Text display={{ base: "block", xl: "none" }} fontSize="xs" color={mutedText}>
                f/{aperture.toFixed(1)}
              </Text>
            </Flex>
            <Box flexGrow={1}>
              <Slider
                aria-label="aperture"
                colorScheme="blue"
                value={aperture}
                onChange={(val: number) => setAperture(val)}
                isDisabled={!!lens?.fixedAperture}
                min={apertureMin}
                max={22}
                step={0.1}
              >
                {[0.8, 1.4, 1.8, 2.8, 4, 5.6, 8, 11, 16, 22].filter((v) => v >= apertureMin).map((val) => (
                  <SliderMark key={val} value={val} {...labelStyles}>
                    {val}
                  </SliderMark>
                ))}
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>
          </Flex>
          {hasDiffractionRisk && (
            <Flex mt={2} justify="flex-start" pl="calc(20% + 8px)">
              <Badge
                colorScheme="orange"
                variant="subtle"
                px={2}
                py={0.5}
                fontSize="xs"
                rounded="md"
              >
                {fill(t.diffraction, diffractionLimitFStop.toFixed(1))}
              </Badge>
            </Flex>
          )}
        </Box>

        {/* Sensor + Subject */}
        <Box pt={6}>
          {isCustomSensor && (
  <Box mt={2}>
    <Flex gap={2} align="center" mb={1}>
      <Text fontSize="xs" w="80px" color={mutedText}>{t.width}</Text>
      <input
        type="number"
        value={customSensorWidth}
        onChange={(e) => setCustomSensorWidth(Number(e.target.value))}
        style={{ width: 70, padding: "2px 6px", borderRadius: 6, border: "1px solid #ccc" }}
      />
    </Flex>
    <Flex gap={2} align="center" mb={1}>
      <Text fontSize="xs" w="80px" color={mutedText}>{t.height}</Text>
      <input
        type="number"
        value={customSensorHeight}
        onChange={(e) => setCustomSensorHeight(Number(e.target.value))}
        style={{ width: 70, padding: "2px 6px", borderRadius: 6, border: "1px solid #ccc" }}
      />
    </Flex>
  </Box>
)}<Flex gap={3} direction={{ base: "column", md: "row" }}>
            <Flex gap={2} width={{ base: "100%", md: "50%" }}>
              <Flex
                w={{ base: "72px", md: "20%" }}
                mt={2}
                justify="flex-end"
                align="center"
                gap={1.5}
                flexShrink={0}
              >
                <Icon as={FiCamera} boxSize={4} color={mutedText} />
                <Text fontSize="sm" textAlign="right">
                  {t.sensor}
                </Text>
              </Flex>
              <Box flexGrow={1}>
                <Select
                  bg={nativeSelectStyles.bg}
                  color={nativeSelectStyles.color}
                  borderColor={nativeSelectStyles.borderColor}
                  iconColor={nativeSelectStyles.iconColor}
                  _hover={nativeSelectStyles._hover}
                  _focus={nativeSelectStyles._focus}
                  _active={nativeSelectStyles._active}
                  sx={nativeSelectStyles.sx}
                  value={sensor}
                  onChange={(evt) => {
                    if (!evt?.target?.value) {
                      return;
                    }
                    setSensor(evt?.target?.value);
                  }}
                >
                  {sensorModes.map((key) => (
                    <option key={key} value={key}>
                      {sensorName(key)}
                    </option>
                  ))}
                </Select>
              </Box>
            </Flex>

            <Flex gap={2} width={{ base: "100%", md: "50%" }}>
              <Flex
                w={{ base: "72px", md: "20%" }}
                mt={2}
                justify="flex-end"
                align="center"
                gap={1.5}
                flexShrink={0}
              >
                <Icon as={TbUser} boxSize={4} color={mutedText} />
                <Text fontSize="sm" textAlign="right">
                  {t.subject}
                </Text>
              </Flex>
              <Box flexGrow={1}>
                <Select
                  bg={nativeSelectStyles.bg}
                  color={nativeSelectStyles.color}
                  borderColor={nativeSelectStyles.borderColor}
                  iconColor={nativeSelectStyles.iconColor}
                  _hover={nativeSelectStyles._hover}
                  _focus={nativeSelectStyles._focus}
                  _active={nativeSelectStyles._active}
                  sx={nativeSelectStyles.sx}
                  value={subject}
                  placeholder={t.subject}
                  onChange={(evt) => {
                    if (
                      SUBJECTS[evt?.target?.value as keyof typeof SUBJECTS]
                    ) {
                      setSubject(evt?.target?.value);
                    }
                  }}
                >
                  {Object.entries(SUBJECTS).map(([key]) => (
                    <option key={key} value={key}>
                      {subjectName(key)}
                    </option>
                  ))}
                </Select>
              </Box>
            </Flex>
          </Flex>
        </Box>

        <Divider mt={6} borderColor={borderColor} />

        {/* Quick Presets */}
        <Box pt={4} pb={2}>
          <Text
            fontSize="xs"
            fontWeight="semibold"
            color={mutedText}
            textAlign="center"
            textTransform="uppercase"
            letterSpacing="wider"
            mb={3}
          >
            {t.presets}
          </Text>
          <Wrap justify="center" spacing={2}>
            {COMMON_SETUPS.map((setup) => (
              <WrapItem key={setup.name}>
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="blue"
                  onClick={() => {
                    setCameraId(setup.cameraId);
                    setLensId(setup.lensId);
                    setFocalLengthInMillimeters(setup.focalLength);
                    setAperture(setup.aperture);
                    setSensor(setup.sensor);
                    setDistanceToSubjectInInches(setup.idealDistance);
                  }}
                >
                  {setup.name}
                </Button>
              </WrapItem>
            ))}
          </Wrap>
        </Box>

        {/* GitHub Footer */}
        <Box pt={2} pb={6} textAlign="center">
          <Button
            as="a"
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            size="sm"
            variant="ghost"
            leftIcon={<Icon as={FiGithub} />}
            color={mutedText}
            _hover={{ color: colorMode === "dark" ? "gray.200" : "gray.800" }}
          >
            {t.github}
          </Button>
          <Text fontSize="xs" color={mutedText} mt={1}>
            Adapté du{" "}
            <a href="https://github.com/jherr/depth-of-field" target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>
              Depth Of Field Simulator
            </a>{" "}
            de Jack Herrington (licence MIT)
          </Text>
        </Box>
      </Box>
      </Box>
      <Box
        w={{ base: "100%", lg: "420px" }}
        flexShrink={0}
        px={{ base: 6, lg: 4 }}
        pt={{ base: 4, lg: 6 }}
        pb={4}
        position={{ base: "static", lg: "sticky" }}
        top={0}
        order={{ base: -1, lg: 0 }}
      >
        <MonitorView
          focalLength={focalLengthInMillimeters}
          aperture={aperture}
          distanceInInches={distanceToSubjectInInches}
          sensorHeightMM={sensorHeight}
          cocMM={circleOfConfusionInMillimeters}
          subject={subject as keyof typeof SUBJECTS}
          hudLabel={convertUnits(distanceToSubjectInInches, 0)}
          title={t.monitor}
          caption={scene.palette.indoor ? t.monitorCaptionIndoor : t.monitorCaption}
          palette={scene.palette}
          exposureDelta={exposureDelta}
          cast={cast}
          noise={grain}
          shutterLabel={isVideo ? `${fps}p ${formatShutter(shutter)}` : formatShutter(shutter)}
          isoLabel={isoLabel}
          recording={isVideo}
          cpl={cplEffect}
          uv={uvOn}
          filterTag={filterTag}
          logView={isLog && !lutPreview}
          profileTag={isLog ? `${logProfile!.name}${lutPreview ? " + LUT" : ""}` : ""}
        />

        {/* Light & exposure controls */}
        <Box mt={4} bg={cardBg} border="1px" borderColor={borderColor} rounded="lg" p={3}>
          <Text fontSize="xs" fontWeight="semibold" color={mutedText} textTransform="uppercase" letterSpacing="wider" mb={2}>
            {t.light}
          </Text>
          <Text fontSize="sm" mb={1}>{t.lightScene}</Text>
          <Select size="sm" value={sceneId} onChange={(e) => selectScene(e.target.value)}
            bg={nativeSelectStyles.bg} color={nativeSelectStyles.color} borderColor={nativeSelectStyles.borderColor} iconColor={nativeSelectStyles.iconColor} sx={nativeSelectStyles.sx}>
            {SCENES.map((sc) => (
              <option key={sc.id} value={sc.id}>{t.scenes[sc.id]}</option>
            ))}
          </Select>

          <Flex justify="space-between" mt={3}>
            <Text fontSize="sm">{t.lightIntensity}</Text>
            <Text fontSize="sm" color={mutedText}>{lightBoost > 0 ? "+" : ""}{lightBoost.toFixed(1)} EV</Text>
          </Flex>
          <Slider aria-label={t.lightIntensity} value={lightBoost} min={-4} max={4} step={0.1} onChange={setLightBoost} colorScheme="yellow">
            <SliderTrack><SliderFilledTrack /></SliderTrack>
            <SliderThumb />
          </Slider>

          <Flex justify="space-between" mt={2}>
            <Text fontSize="sm">{t.lightColor}</Text>
            <Text fontSize="sm" color={mutedText}>{lightK} K</Text>
          </Flex>
          <Slider aria-label={t.lightColor} value={lightK} min={2000} max={10000} step={100} onChange={setLightK}>
            <SliderTrack bgGradient="linear(to-r, #ff8a2a, #ffd9a0, #ffffff, #cfe0ff, #8fb4ff)" h="6px">
              <SliderFilledTrack bg="transparent" />
            </SliderTrack>
            <SliderThumb />
          </Slider>

          <Divider my={3} borderColor={borderColor} />
          <Text fontSize="xs" fontWeight="semibold" color={mutedText} textTransform="uppercase" letterSpacing="wider" mb={2}>
            {t.cameraSettings}
          </Text>
          <Flex gap={2} mb={3}>
            {(["photo", "video"] as const).map((m) => (
              <Button key={m} size="sm" flex={1} colorScheme={m === "video" ? "red" : "blue"}
                variant={shootMode === m ? "solid" : "outline"} onClick={() => setShootMode(m)}>
                {m === "photo" ? `📷 ${t.photo}` : `🎬 ${t.video}`}
              </Button>
            ))}
          </Flex>
          {isVideo ? (
            <>
              <SimpleGrid columns={2} spacing={2}>
                <Box>
                  <Text fontSize="xs" color={mutedText}>{t.videoSystem}</Text>
                  <Select size="sm" value={vSystem} onChange={(e) => {
                      const sys = e.target.value as VideoSystem;
                      changeVideo(sys, VIDEO_SYSTEMS[sys].fps[0]);
                    }}
                    bg={nativeSelectStyles.bg} color={nativeSelectStyles.color} borderColor={nativeSelectStyles.borderColor} iconColor={nativeSelectStyles.iconColor} sx={nativeSelectStyles.sx}>
                    <option value="PAL">PAL (50 Hz)</option>
                    <option value="NTSC">NTSC (60 Hz)</option>
                  </Select>
                </Box>
                <Box>
                  <Text fontSize="xs" color={mutedText}>{t.frameRate}</Text>
                  <Select size="sm" value={String(fps)} onChange={(e) => changeVideo(vSystem, Number(e.target.value))}
                    bg={nativeSelectStyles.bg} color={nativeSelectStyles.color} borderColor={nativeSelectStyles.borderColor} iconColor={nativeSelectStyles.iconColor} sx={nativeSelectStyles.sx}>
                    {VIDEO_SYSTEMS[vSystem].fps.map((f) => (
                      <option key={f} value={String(f)}>{f === 24 ? "24p (23.98)" : `${f}p`}</option>
                    ))}
                  </Select>
                </Box>
                <Box>
                  <Text fontSize="xs" color={mutedText}>{t.shutter}</Text>
                  <Select size="sm" value={String(vShutter)} onChange={(e) => setVShutter(Number(e.target.value))}
                    bg={nativeSelectStyles.bg} color={nativeSelectStyles.color} borderColor={nativeSelectStyles.borderColor} iconColor={nativeSelectStyles.iconColor} sx={nativeSelectStyles.sx}>
                    {videoShutters(vSystem, fps).map((v) => (
                      <option key={v} value={String(v)}>{formatShutter(v)}</option>
                    ))}
                  </Select>
                </Box>
                <Box>
                  <Text fontSize="xs" color={mutedText}>ISO</Text>
                  <Select size="sm" value={isoAuto ? "auto" : String(Math.max(iso, minIso))}
                    onChange={(e) => {
                      if (e.target.value === "auto") setIsoAuto(true);
                      else { setIsoAuto(false); setIso(Number(e.target.value)); }
                    }}
                    bg={nativeSelectStyles.bg} color={nativeSelectStyles.color} borderColor={nativeSelectStyles.borderColor} iconColor={nativeSelectStyles.iconColor} sx={nativeSelectStyles.sx}>
                    <option value="auto">{t.isoAuto}</option>
                    {[...new Set([minIso, ...ISOS.filter((v) => v >= minIso && v <= maxIso)])].map((v) => (
                      <option key={v} value={String(v)}>{v}</option>
                    ))}
                  </Select>
                </Box>
              </SimpleGrid>
              <Text fontSize="xs" color={Math.abs(Math.log2(shutter / ideal180)) < 0.2 ? "green.500" : mutedText} mt={2}>
                {Math.abs(Math.log2(shutter / ideal180)) < 0.2 ? "✓ " : ""}{fill(t.rule180, Math.round(1 / ideal180))}
              </Text>
            </>
          ) : (
          <>
          <RadioGroup value={expMode} onChange={(v) => setExpMode(v as "M" | "A")}>
            <Stack direction="row" spacing={4}>
              <Radio value="M" size="sm">{t.modeM}</Radio>
              <Radio value="A" size="sm">{t.modeA}</Radio>
            </Stack>
          </RadioGroup>
          <SimpleGrid columns={2} spacing={2} mt={2}>
            <Box>
              <Text fontSize="xs" color={mutedText}>{t.shutter}</Text>
              {expMode === "M" ? (
                <Select size="sm" value={String(shutterM)} onChange={(e) => setShutterM(Number(e.target.value))}
                  bg={nativeSelectStyles.bg} color={nativeSelectStyles.color} borderColor={nativeSelectStyles.borderColor} iconColor={nativeSelectStyles.iconColor} sx={nativeSelectStyles.sx}>
                  {SHUTTER_SPEEDS.map((v) => (
                    <option key={v} value={String(v)}>{formatShutter(v)}</option>
                  ))}
                </Select>
              ) : (
                <Text fontSize="md" fontWeight="bold" pt={1}>{formatShutter(shutter)}</Text>
              )}
            </Box>
            <Box>
              <Text fontSize="xs" color={mutedText}>ISO</Text>
              <Select size="sm" value={String(Math.max(iso, minIso))} onChange={(e) => setIso(Number(e.target.value))}
                bg={nativeSelectStyles.bg} color={nativeSelectStyles.color} borderColor={nativeSelectStyles.borderColor} iconColor={nativeSelectStyles.iconColor} sx={nativeSelectStyles.sx}>
                {[...new Set([minIso, ...ISOS.filter((v) => v >= minIso && v <= maxIso)])].map((v) => (
                  <option key={v} value={String(v)}>{v}</option>
                ))}
              </Select>
            </Box>
          </SimpleGrid>
          </>
          )}
          <Text fontSize="xs" color={mutedText} mt={2}>{t.profile}</Text>
          <Select size="sm" value={isLog ? profileId : "standard"} onChange={(e) => setProfileId(e.target.value)}
            bg={nativeSelectStyles.bg} color={nativeSelectStyles.color} borderColor={nativeSelectStyles.borderColor} iconColor={nativeSelectStyles.iconColor} sx={nativeSelectStyles.sx}>
            <option value="standard">{t.standard}</option>
            {logProfiles.map((p) => (
              <option key={p.id} value={p.id}>{p.name === "Log" && !camera ? t.logGeneric : p.name}</option>
            ))}
          </Select>
          {isLog && (
            <>
              <Checkbox size="sm" mt={2} isChecked={lutPreview} onChange={(e) => setLutPreview(e.target.checked)}>{t.lutPreview}</Checkbox>
              <Text fontSize="xs" color={mutedText} mt={1}>{fill(t.logTip, minIso)}</Text>
            </>
          )}
          <Text fontSize="xs" color={mutedText} mt={2}>{t.wb}</Text>
          <Select size="sm" value={wbMode} onChange={(e) => setWbMode(e.target.value as WbMode)}
            bg={nativeSelectStyles.bg} color={nativeSelectStyles.color} borderColor={nativeSelectStyles.borderColor} iconColor={nativeSelectStyles.iconColor} sx={nativeSelectStyles.sx}>
            {WB_MODES.map((m) => (
              <option key={m} value={m}>{t.wbModes[m]}</option>
            ))}
          </Select>
          {wbMode === "kelvin" && (
            <Box mt={2}>
              <Flex justify="flex-end"><Text fontSize="xs" color={mutedText}>{wbManualK} K</Text></Flex>
              <Slider aria-label={t.wb} value={wbManualK} min={2500} max={10000} step={100} onChange={setWbManualK}>
                <SliderTrack bgGradient="linear(to-r, #8fb4ff, #cfe0ff, #ffffff, #ffd9a0, #ff8a2a)" h="6px">
                  <SliderFilledTrack bg="transparent" />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>
          )}
          {/* Filters */}
          <Divider my={3} borderColor={borderColor} />
          <Text fontSize="xs" fontWeight="semibold" color={mutedText} textTransform="uppercase" letterSpacing="wider" mb={2}>
            {t.filters}
          </Text>
          <Text fontSize="xs" color={mutedText}>{t.nd}</Text>
          <Select size="sm" value={ndId} onChange={(e) => setNdId(e.target.value)}
            bg={nativeSelectStyles.bg} color={nativeSelectStyles.color} borderColor={nativeSelectStyles.borderColor} iconColor={nativeSelectStyles.iconColor} sx={nativeSelectStyles.sx}>
            {ND_FILTERS.map((n) => (
              <option key={n.id} value={n.id}>
                {n.id === "none" ? t.none : n.id === "vnd" ? t.ndVariable : `${n.label} (${fill(t.stops, n.stops)})`}
              </option>
            ))}
          </Select>
          {ndId === "vnd" && (
            <Box mt={2}>
              <Flex justify="flex-end"><Text fontSize="xs" color={mutedText}>{fill(t.stops, vndStops)}</Text></Flex>
              <Slider aria-label={t.ndVariable} value={vndStops} min={1} max={9} step={0.5} onChange={setVndStops} colorScheme="gray">
                <SliderTrack><SliderFilledTrack /></SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>
          )}
          <Flex gap={4} mt={3} wrap="wrap">
            <Checkbox size="sm" isChecked={cplOn} onChange={(e) => setCplOn(e.target.checked)}>{t.cpl}</Checkbox>
            <Checkbox size="sm" isChecked={uvOn} onChange={(e) => setUvOn(e.target.checked)}>{t.uv}</Checkbox>
          </Flex>
          {cplOn && (
            <Box mt={2}>
              <Flex justify="space-between"><Text fontSize="xs" color={mutedText}>{t.cplRotation}</Text><Text fontSize="xs" color={mutedText}>{cplRot}°</Text></Flex>
              <Slider aria-label={t.cplRotation} value={cplRot} min={0} max={90} step={1} onChange={setCplRot} colorScheme="cyan">
                <SliderTrack><SliderFilledTrack /></SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>
          )}
          {filterStops > 0 && (
            <Text fontSize="xs" color={mutedText} mt={2}>{fill(t.filterLoss, Math.round(filterStops * 10) / 10)}</Text>
          )}

          {(isVideo || expMode === "M") && (
            <Button size="xs" mt={3} variant="outline" colorScheme="teal" w="100%"
              onClick={autoExposeNow}>
              {t.autoExpose}
            </Button>
          )}
          {flickerRisk && (
            <Badge mt={2} colorScheme="orange" variant="subtle" fontSize="xs" whiteSpace="normal" textTransform="none" display="block" px={2} py={1} rounded="md">
              {fill(t.flicker, vSystem === "PAL" ? "1/50, 1/100" : "1/60, 1/120", mainsHz)}
            </Badge>
          )}
          {useAutoIso && autoIsoResult.atLimit && (
            <Badge mt={2} colorScheme="red" variant="subtle" fontSize="xs" whiteSpace="normal" textTransform="none" display="block" px={2} py={1} rounded="md">
              {fill(t.isoLimit, autoIsoResult.display)}
            </Badge>
          )}
          {hasShakeRisk && (
            <Badge mt={2} colorScheme="orange" variant="subtle" fontSize="xs" whiteSpace="normal" textTransform="none" display="block" px={2} py={1} rounded="md">
              {fill(t.shake, shakeLimit)}
            </Badge>
          )}
        </Box>
      </Box>
      </Flex>
    </>
  );
}

export default App;
