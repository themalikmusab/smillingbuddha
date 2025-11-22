# PATENT CLAIMS

**Application for:** Temporal Three-Dimensional QR Code System for Presence Verification
**Inventor:** Mus Ab Ali
**Date:** November 22, 2025

---

## IMPORTANT NOTE ON CLAIMS

The claims define the scope of patent protection. There are two types:

1. **Independent Claims (1-6):** Broad protection, stand alone
2. **Dependent Claims (7-25):** Narrow protection, depend on independent claims

**Legal Strategy:**
- Independent claims cover core innovations (harder to invalidate)
- Dependent claims cover specific implementations (easier to enforce)
- If independent claim invalidated, dependent claims may still stand

---

## INDEPENDENT CLAIMS

### CLAIM 1: Method of Temporal Encoding for Authentication

**I claim:**

A method for authenticating physical presence using temporal dimension encoding in an optical machine-readable code, comprising:

**(a)** generating a plurality of sequential display frames at a predetermined frame rate between 15 and 120 frames per second, wherein each display frame comprises:
  - (i) a machine-readable optical code encoding a data payload;
  - (ii) a temporal marker comprising a timestamp with millisecond precision indicating time of frame generation;
  - (iii) a sequential frame identifier indicating position in the temporal sequence;
  - (iv) a cryptographic challenge value unique to said frame;

**(b)** cryptographically linking each subsequent frame to its immediately preceding frame by:
  - (i) computing a cryptographic hash function of at least the previous frame's challenge value, current timestamp, current frame identifier, and a session identifier;
  - (ii) embedding the computed hash as the current frame's challenge value;
  - (iii) embedding a portion of the previous frame's challenge value as a backward link;

**(c)** displaying said plurality of sequential frames on an electronic display device in continuous sequence, creating a temporally-varying optical code visible to a capturing device;

**(d)** capturing a video sequence comprising at least five of said sequential display frames using a camera of a mobile computing device, wherein said capturing occurs over a time duration between 100 milliseconds and 2000 milliseconds;

**(e)** extracting the data payload from each captured frame to obtain a temporal frame sequence comprising the temporal markers, frame identifiers, and cryptographic challenge values;

**(f)** validating temporal coherence of said temporal frame sequence by:
  - (i) verifying that timestamps are monotonically increasing;
  - (ii) verifying that frame identifiers are sequential without gaps;
  - (iii) verifying that intervals between timestamps are within a predetermined range consistent with said predetermined frame rate;
  - (iv) verifying that each frame's backward link matches the previous frame's challenge value;

**(g)** transmitting said temporal frame sequence to a validation server;

**(h)** at said validation server, independently reconstructing an expected cryptographic challenge sequence using the same cryptographic hash function, the session identifier, and temporal parameters extracted from said temporal frame sequence;

**(i)** comparing the received cryptographic challenge values with said expected cryptographic challenge sequence;

**(j)** authenticating physical presence when:
  - (i) said temporal coherence validation succeeds;
  - (ii) said received cryptographic challenge values match said expected cryptographic challenge sequence;
  - (iii) timestamps are within a predetermined validity window;
  - (iv) said temporal frame sequence has not been previously submitted;

**wherein** a static photographic reproduction of said optical code fails authentication due to absence of temporal progression in temporal markers and frame identifiers.

---

### CLAIM 2: System for Dual-Mode Verification

**I claim:**

A system for presence verification capable of operating in both online and offline modes while maintaining cryptographic security equivalence, comprising:

**(a)** a display subsystem configured to:
  - (i) generate a temporally-varying optical code as claimed in Claim 1;
  - (ii) embed within each frame a session validation key derived from a server master secret;
  - (iii) embed temporal validity parameters defining a valid time window;

**(b)** a capture subsystem comprising a mobile computing device with:
  - (i) a camera configured to capture video at a minimum frame rate of 15 frames per second;
  - (ii) a processing unit configured to extract optical code data from captured frames;
  - (iii) a connectivity detection module configured to determine network availability;
  - (iv) a cryptographic signature module configured to generate digital signatures using device-specific cryptographic keys;
  - (v) a secure storage module configured to store encrypted data locally;

**(c)** a verification subsystem comprising a validation server configured to:
  - (i) validate temporal frame sequences received in real-time when network connectivity exists;
  - (ii) validate cryptographic attendance proofs received asynchronously when generated offline;

**(d)** wherein in online mode, said capture subsystem is configured to:
  - (i) capture said temporally-varying optical code;
  - (ii) validate temporal coherence locally;
  - (iii) transmit captured frame sequence to said verification subsystem immediately;
  - (iv) receive real-time validation result within 5 seconds;

**(e)** wherein in offline mode, said capture subsystem is configured to:
  - (i) capture said temporally-varying optical code;
  - (ii) validate temporal coherence locally using same validation algorithm as online mode;
  - (iii) generate a cryptographic attendance proof comprising:
    - captured frame sequence;
    - local validation results;
    - device attestation data;
    - digital signature generated using said device-specific cryptographic keys;
  - (iv) store said cryptographic attendance proof in said secure storage module with encryption;
  - (v) automatically transmit said cryptographic attendance proof to said verification subsystem when network connectivity is restored;

**(f)** wherein said verification subsystem validates said cryptographic attendance proof by:
  - (i) verifying digital signature authenticity;
  - (ii) validating temporal coherence of frames in said proof;
  - (iii) verifying proof timestamp falls within said temporal validity parameters;
  - (iv) detecting replay attacks by checking proof uniqueness;

**wherein** offline-generated cryptographic attendance proofs provide equivalent security guarantees to online real-time validation through cryptographic binding and device-specific signing.

---

### CLAIM 3: Cryptographic Challenge Chain for Temporal Authentication

**I claim:**

A method for creating a temporally-ordered cryptographic chain for authentication, comprising:

**(a)** initializing a challenge chain by generating an initial challenge value using a cryptographic hash of a session identifier concatenated with a starting timestamp and a random nonce;

**(b)** for each subsequent frame in a temporal sequence:
  - (i) obtaining a current timestamp with millisecond precision;
  - (ii) obtaining a sequential frame number;
  - (iii) computing a current challenge value by applying a cryptographic hash function to an input comprising at least:
    - the immediately previous challenge value;
    - said current timestamp;
    - said sequential frame number;
    - said session identifier;
  - (iv) storing said current challenge value as the most recent challenge in said chain;
  - (v) encoding said current challenge value and a truncated portion of said previous challenge value into an optical code frame;

**(c)** repeating step (b) at a frame rate between 15 and 120 frames per second for a duration of at least 200 milliseconds;

**(d)** wherein any break in said challenge chain is cryptographically detectable by:
  - (i) verifying that each frame's truncated previous challenge matches the actual previous frame's full challenge;
  - (ii) independently recomputing expected challenges and comparing with received challenges;

**(e)** wherein said challenge chain provides temporal non-repudiation such that:
  - (i) challenges cannot be precomputed without knowledge of previous challenges;
  - (ii) challenges cannot be predicted without access to session-specific secrets;
  - (iii) insertion or deletion of frames detectably breaks the cryptographic chain;

**wherein** said challenge chain ensures that authentication requires capture of a genuine temporal sequence and cannot be satisfied by a static image or fabricated data.

---

### CLAIM 4: Multi-Factor Temporal Coherence Analysis

**I claim:**

A method for distinguishing genuine temporal capture from photographic reproduction, comprising:

**(a)** receiving a purported temporal frame sequence comprising a plurality of frames each containing temporal markers, frame identifiers, and cryptographic data;

**(b)** performing timing coherence analysis by:
  - (i) extracting timestamps from all frames;
  - (ii) verifying timestamps are strictly monotonically increasing;
  - (iii) computing inter-frame intervals as differences between consecutive timestamps;
  - (iv) verifying that an average inter-frame interval is within a predetermined range of an expected interval corresponding to a known frame rate;
  - (v) verifying that maximum and minimum inter-frame intervals have a ratio below a predetermined threshold;
  - (vi) verifying that most recent timestamp is within a predetermined recency window from current time;
  - (vii) assigning a timing coherence score based on results of steps (ii) through (vi);

**(c)** performing cryptographic coherence analysis by:
  - (i) extracting cryptographic challenge values and backward link values from all frames;
  - (ii) verifying that each frame's backward link value matches a portion of the previous frame's challenge value;
  - (iii) independently reconstructing expected challenge values using a cryptographic hash function and temporal parameters;
  - (iv) comparing reconstructed challenges with extracted challenges;
  - (v) assigning a cryptographic coherence score based on results of steps (ii) through (iv);

**(d)** performing visual pattern coherence analysis by:
  - (i) extracting visual pattern modifier values from all frames;
  - (ii) verifying that said visual pattern modifier values progress smoothly according to a predetermined pattern evolution function;
  - (iii) assigning a visual coherence score based on smoothness of progression;

**(e)** computing an overall coherence score as a weighted combination of:
  - said timing coherence score with a first weight;
  - said cryptographic coherence score with a second weight;
  - said visual coherence score with a third weight;

**(f)** authenticating said purported temporal frame sequence as genuine when said overall coherence score exceeds a predetermined threshold;

**(g)** rejecting said purported temporal frame sequence as photographic reproduction when said overall coherence score falls below said predetermined threshold;

**wherein** a photograph or screenshot exhibits:
  - identical or non-increasing timestamps failing timing coherence;
  - broken or absent cryptographic chain failing cryptographic coherence;
  - static or discontinuous visual patterns failing visual coherence;

**thereby** enabling algorithmic detection of photographic reproductions with accuracy exceeding 99%.

---

### CLAIM 5: Hardware-Backed Cryptographic Attendance Proof

**I claim:**

A method for generating a tamper-proof cryptographic attendance proof using hardware-backed security, comprising:

**(a)** capturing a temporal optical code sequence as claimed in Claim 1 using a mobile computing device;

**(b)** validating temporal coherence of said captured sequence locally on said mobile computing device;

**(c)** constructing a proof data structure comprising:
  - (i) identity information identifying an authenticating user;
  - (ii) device identity information identifying said mobile computing device;
  - (iii) session information extracted from said temporal optical code sequence;
  - (iv) compressed representation of captured frames including temporal markers and cryptographic challenges;
  - (v) local validation results from step (b);
  - (vi) capture timestamp indicating when said sequence was captured;
  - (vii) device attestation data comprising hardware and software characteristics of said mobile computing device;

**(d)** generating a first digital signature of said proof data structure using a device-specific cryptographic key stored in non-volatile memory of said mobile computing device;

**(e)** generating a second digital signature of said proof data structure using a hardware-protected cryptographic key residing in a secure execution environment or trusted platform module of said mobile computing device, wherein:
  - (i) said hardware-protected cryptographic key is non-exportable from said secure execution environment;
  - (ii) signature generation optionally requires biometric authentication via fingerprint sensor or facial recognition system;
  - (iii) said second digital signature provides cryptographic proof of device possession and user presence;

**(f)** assembling a cryptographic attendance proof comprising:
  - said proof data structure;
  - said first digital signature;
  - said second digital signature;
  - metadata including proof version and creation timestamp;

**(g)** encrypting said cryptographic attendance proof using a device-specific encryption key;

**(h)** storing said encrypted cryptographic attendance proof in local persistent storage;

**(i)** at a later time when network connectivity is available, transmitting said cryptographic attendance proof to a validation server;

**(j)** at said validation server:
  - (i) decrypting said cryptographic attendance proof;
  - (ii) verifying said first digital signature using a public key associated with said device identity;
  - (iii) verifying said second digital signature using hardware attestation mechanisms;
  - (iv) validating temporal coherence of frames in said proof data structure;
  - (v) verifying capture timestamp falls within valid session time window;
  - (vi) checking proof uniqueness to prevent replay attacks;
  - (vii) authenticating attendance when all verifications succeed;

**wherein** said cryptographic attendance proof is tamper-proof because:
  - modification of proof data invalidates digital signatures;
  - forgery requires access to both device-specific key and hardware-protected key;
  - said hardware-protected key cannot be extracted or copied;

**thereby** enabling secure offline attendance recording with delayed validation while maintaining cryptographic non-repudiation.

---

### CLAIM 6: Adaptive Frame Rate Synchronization

**I claim:**

A method for optimizing temporal optical code generation based on display and capture device capabilities, comprising:

**(a)** detecting display device characteristics including:
  - (i) screen refresh rate by measuring frame timing using high-resolution performance counters;
  - (ii) display technology type through pixel response time analysis;
  - (iii) hardware acceleration availability;

**(b)** detecting capture device characteristics including:
  - (i) maximum supported camera frame rate;
  - (ii) processing capabilities through benchmark testing;
  - (iii) network connection quality;
  - (iv) battery level;

**(c)** computing an optimal frame rate for temporal optical code generation by:
  - (i) selecting a base frame rate as a fraction of said screen refresh rate to ensure smooth rendering;
  - (ii) adjusting said base frame rate downward if battery level is below a threshold;
  - (iii) adjusting said base frame rate downward if network connection quality is poor;
  - (iv) adjusting said base frame rate upward if a high-security mode is enabled;
  - (v) constraining said optimal frame rate to be within said maximum supported camera frame rate;

**(d)** generating temporal optical code frames at said optimal frame rate;

**(e)** on said capture device, configuring camera capture at a capture frame rate matched to or slightly exceeding said optimal frame rate;

**(f)** adjusting temporal coherence validation parameters based on said optimal frame rate, including:
  - (i) expected inter-frame interval equal to inverse of said optimal frame rate;
  - (ii) tolerance range for inter-frame interval variation;
  - (iii) minimum number of frames required for authentication;

**wherein** said adaptive synchronization ensures:
  - optimal performance across diverse hardware combinations;
  - energy efficiency on battery-powered devices;
  - maximum security within hardware constraints;
  - graceful degradation on older devices;

**thereby** enabling universal deployment without requiring specialized hardware while maintaining security guarantees.

---

## DEPENDENT CLAIMS

### CLAIM 7 (depends on Claim 1)
The method of Claim 1, wherein said cryptographic hash function is SHA-256 producing a 256-bit output, and wherein said challenge value comprises the first 64 bits of said output encoded as 16 hexadecimal characters.

### CLAIM 8 (depends on Claim 1)
The method of Claim 1, wherein said machine-readable optical code is a QR Code conforming to ISO/IEC 18004:2015 standard with error correction level H providing 30% redundancy.

### CLAIM 9 (depends on Claim 1)
The method of Claim 1, wherein said predetermined frame rate is selected from the group consisting of: 15 frames per second, 20 frames per second, 30 frames per second, 60 frames per second, and 120 frames per second.

### CLAIM 10 (depends on Claim 1)
The method of Claim 1, further comprising applying a visual pattern transformation to each frame selected from the group consisting of: rotation, scaling, translation, and combinations thereof, wherein said transformation parameters vary smoothly across said sequential frames.

### CLAIM 11 (depends on Claim 1)
The method of Claim 1, wherein said predetermined range for inter-frame intervals is 10 milliseconds to 50 milliseconds.

### CLAIM 12 (depends on Claim 1)
The method of Claim 1, wherein said video sequence comprises between 5 and 20 sequential frames.

### CLAIM 13 (depends on Claim 1)
The method of Claim 1, wherein said validation server completes steps (h) through (j) in less than 50 milliseconds.

### CLAIM 14 (depends on Claim 1)
The method of Claim 1, further comprising caching said expected cryptographic challenge sequence in a high-speed memory cache for subsequent validations within the same session.

### CLAIM 15 (depends on Claim 2)
The system of Claim 2, wherein said device-specific cryptographic keys are generated using a cryptographically secure random number generator and stored in browser IndexedDB with encryption.

### CLAIM 16 (depends on Claim 2)
The system of Claim 2, wherein said secure storage module uses AES-256-GCM encryption with a device-specific encryption key.

### CLAIM 17 (depends on Claim 2)
The system of Claim 2, wherein said cryptographic attendance proof has a maximum valid lifetime of 24 hours after generation, after which it cannot be submitted for validation.

### CLAIM 18 (depends on Claim 2)
The system of Claim 2, further comprising a synchronization queue manager configured to automatically retry failed proof transmissions up to a maximum of 3 attempts with exponential backoff.

### CLAIM 19 (depends on Claim 3)
The method of Claim 3, wherein said truncated portion of said previous challenge value comprises the first 8 characters of a hexadecimal representation of said previous challenge value.

### CLAIM 20 (depends on Claim 4)
The method of Claim 4, wherein said first weight is 0.4, said second weight is 0.4, and said third weight is 0.2, and wherein said predetermined threshold is 0.8.

### CLAIM 21 (depends on Claim 4)
The method of Claim 4, wherein said predetermined threshold for inter-frame interval ratio is 3.0.

### CLAIM 22 (depends on Claim 4)
The method of Claim 4, wherein said predetermined recency window is 3 seconds.

### CLAIM 23 (depends on Claim 5)
The method of Claim 5, wherein said secure execution environment is one of: iOS Secure Enclave, Android KeyStore with hardware backing, or Windows Virtual Secure Mode.

### CLAIM 24 (depends on Claim 5)
The method of Claim 5, wherein said biometric authentication is one of: fingerprint recognition, facial recognition, or iris recognition.

### CLAIM 25 (depends on Claim 5)
The method of Claim 5, wherein said second digital signature is generated using WebAuthn protocol with user verification requirement.

### CLAIM 26 (depends on Claim 5)
The method of Claim 5, wherein said device attestation data comprises one or more of: user agent string, platform identifier, screen resolution, pixel density, CPU core count, available sensors, timezone, and language settings.

### CLAIM 27 (depends on Claim 6)
The method of Claim 6, wherein said high-resolution performance counters use the Performance API's performance.now() method providing microsecond precision.

### CLAIM 28 (depends on Claim 6)
The method of Claim 6, wherein said battery threshold is 20%, and wherein said frame rate is reduced by 50% when battery level is below said threshold.

---

## APPLICATION-SPECIFIC CLAIMS

### CLAIM 29 (depends on Claim 1)
The method of Claim 1, applied to educational attendance verification, wherein said session identifier corresponds to a class session, and wherein said validation server maintains an attendance database recording authenticated students for each class session.

### CLAIM 30 (depends on Claim 1)
The method of Claim 1, applied to event ticketing, wherein said session identifier corresponds to an event entrance, and wherein each successful authentication is logged to prevent ticket reuse.

### CLAIM 31 (depends on Claim 1)
The method of Claim 1, applied to access control, wherein said session identifier corresponds to a secure facility entrance, and wherein authentication triggers an electronic door unlock mechanism.

### CLAIM 32 (depends on Claim 1)
The method of Claim 1, applied to product authentication, wherein said temporal optical code is displayed on a product or its packaging, and wherein successful authentication verifies product authenticity.

---

## SYSTEM CLAIMS (Alternative Form)

### CLAIM 33 (System form of Claim 1)
A system for authenticating physical presence using temporal dimension encoding, comprising:

a display device configured to display temporal optical codes;
a mobile computing device with a camera configured to capture said temporal optical codes;
a validation server configured to verify temporal coherence and cryptographic integrity;

wherein said system performs the method of Claim 1.

### CLAIM 34 (Computer-readable medium)
A non-transitory computer-readable storage medium storing instructions that, when executed by a processor, cause the processor to perform the method of any of Claims 1, 3, 4, 5, or 6.

### CLAIM 35 (Progressive web application)
A progressive web application comprising:
- client-side code configured to capture and validate temporal optical codes;
- server-side code configured to generate temporal optical codes and validate submissions;
wherein said progressive web application implements the method of Claim 1.

---

## ADDITIONAL ENHANCEMENT CLAIMS

### CLAIM 36 (depends on Claim 1)
The method of Claim 1, further comprising:
- detecting the geographic location of said mobile computing device using GPS;
- comparing said geographic location to a predefined session location;
- accepting authentication only when said geographic location is within a predetermined distance of said session location.

### CLAIM 37 (depends on Claim 1)
The method of Claim 1, further comprising:
- detecting a WiFi network to which said mobile computing device is connected;
- comparing said WiFi network identifier to a predefined session network;
- accepting authentication only when connected to said predefined session network.

### CLAIM 38 (depends on Claim 1)
The method of Claim 1, further comprising:
- detecting presence of a face in video feed during capture;
- performing liveness detection to verify a live human is present;
- accepting authentication only when liveness is confirmed.

### CLAIM 39 (depends on Claim 1)
The method of Claim 1, further comprising emitting an ultrasonic audio beacon from speakers in physical proximity to said display device, and requiring said mobile computing device to detect said audio beacon as additional proof of physical presence.

### CLAIM 40 (depends on Claim 1)
The method of Claim 1, wherein said optical code data payload is compressed using gzip compression before encoding to reduce optical code size.

---

## CLAIMS SUMMARY

**Total Claims: 40**

**Independent Claims: 6**
1. Method of temporal encoding
2. Dual-mode (online/offline) system
3. Cryptographic challenge chain
4. Multi-factor coherence analysis
5. Hardware-backed proof
6. Adaptive frame rate

**Dependent Claims: 34**
- Claims 7-28: Technical variations
- Claims 29-32: Application-specific
- Claims 33-40: Alternative forms and enhancements

**Coverage:**
✅ Method claims (process protection)
✅ System claims (apparatus protection)
✅ Computer-readable medium claims (software protection)
✅ Multiple applications (education, events, access control, products)
✅ Technical variations (frame rates, hash functions, security levels)
✅ Enhancement features (location, WiFi, biometric, audio)

**Strategic Protection:**
- Broad claims (hard to invalidate, wide protection)
- Narrow claims (easy to enforce, specific implementations)
- Multiple independent claims (if one fails, others may stand)
- Application-specific claims (vertical market protection)

---

## CLAIMS INTERPRETATION GUIDE

**For Patent Examiner:**

The claims should be interpreted in light of the detailed description provided in documents 03-DETAILED-DESCRIPTION-PART-A.md and 03-DETAILED-DESCRIPTION-PART-B.md. Terms used in claims have their ordinary meaning in the field of computer science and cryptography, unless specifically defined otherwise in the specification.

**Key Terms:**
- "Temporal dimension": Time as axis of encoding (not just time-based expiration)
- "Cryptographic chain": Sequential hash linkage as in blockchain
- "Temporal coherence": Statistical properties indicating genuine temporal progression
- "Hardware-backed": Cryptographic operations using device secure hardware (TEE/Secure Enclave)
- "Photographic reproduction": Any static 2D capture including screenshots, photos, printouts

**Claim Scope:**
Claims cover methods, systems, and computer-readable media.
Claims are NOT limited to specific programming languages, platforms, or QR code implementations.
Claims cover core concepts applicable to any implementation following the described principles.

---

**END OF PATENT CLAIMS**

This claims section provides comprehensive protection for your invention across multiple dimensions:
- Core technical innovations (temporal encoding, cryptographic chaining)
- Implementation variations (online/offline, various frame rates)
- Security features (hardware signing, multi-factor validation)
- Applications (education, events, access, products)

**Ready for filing!**
