import 'package:flutter/material.dart';
import '../data/medication_data.dart';

class MedicationFormHeader extends StatelessWidget {
  const MedicationFormHeader({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
      child: Row(
        children: [
          Container(
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.15),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white.withOpacity(0.1)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: IconButton(
              onPressed: () => Navigator.pop(context),
              icon: const Icon(
                Icons.arrow_back_rounded,
                color: Colors.white,
                size: 26,
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Medication Recommendation',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                    letterSpacing: 0.5,
                    shadows: [
                      Shadow(
                        color: Colors.black26,
                        offset: Offset(0, 2),
                        blurRadius: 4,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'powered by ML'.toUpperCase(),
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: Colors.cyanAccent, // Neon accent
                    letterSpacing: 1.0,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Colors.white.withOpacity(0.25),
                  Colors.white.withOpacity(0.05),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white.withOpacity(0.3)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: const Icon(
              Icons.auto_awesome_rounded,
              color: Colors.amberAccent,
              size: 32,
            ),
          ),
        ],
      ),
    );
  }
}

class MedicationCategorySection extends StatelessWidget {
  final String title;
  final List<String> categoryFeatures;
  final IconData icon;
  final Map<String, TextEditingController> controllers;
  final Function(String, String) onFieldChanged;

  const MedicationCategorySection({
    super.key,
    required this.title,
    required this.categoryFeatures,
    required this.icon,
    required this.controllers,
    required this.onFieldChanged,
  });

  @override
  Widget build(BuildContext context) {
    final categoryColor =
        MedicationData.categoryColors[title] ?? MedicationData.primaryColor;

    return Container(
      margin: const EdgeInsets.only(bottom: 24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(30),
        boxShadow: [
          BoxShadow(
            color: categoryColor.withOpacity(0.15),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
        border: Border.all(color: Colors.grey.withOpacity(0.1), width: 1),
      ),
      child: Theme(
        data: Theme.of(context).copyWith(
          dividerColor: Colors.transparent,
          colorScheme: ColorScheme.light(primary: categoryColor),
        ),
        child: ExpansionTile(
          initiallyExpanded: true,
          tilePadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          childrenPadding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
          leading: Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  categoryColor.withOpacity(0.2),
                  categoryColor.withOpacity(0.05),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(icon, color: categoryColor, size: 28),
          ),
          title: Text(
            title,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: Color(0xFF263238), // Dark Blue Grey
              letterSpacing: 0.5,
            ),
          ),
          subtitle: Text(
            '${categoryFeatures.length} fields',
            style: TextStyle(
              fontSize: 13,
              color: Colors.grey.shade600,
              fontWeight: FontWeight.w500,
            ),
          ),
          children: [
            LayoutBuilder(
              builder: (context, constraints) {
                // 2 columns if width > 400
                final crossAxisCount = constraints.maxWidth > 400 ? 2 : 1;
                return Wrap(
                  spacing: 20,
                  runSpacing: 20,
                  children: categoryFeatures.map((feature) {
                    return SizedBox(
                      width: crossAxisCount == 2
                          ? (constraints.maxWidth - 20) / 2
                          : constraints.maxWidth,
                      child: MedicationFormField(
                        feature: feature,
                        controller: controllers[feature],
                        accentColor: categoryColor,
                        onChanged: (val) => onFieldChanged(feature, val),
                      ),
                    );
                  }).toList(),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

class MedicationFormField extends StatelessWidget {
  final String feature;
  final TextEditingController? controller;
  final Color accentColor;
  final Function(String) onChanged;

  const MedicationFormField({
    super.key,
    required this.feature,
    required this.controller,
    required this.accentColor,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final meta = MedicationData.getFeatureMeta(feature);
    final isDropdown = meta?['type'] == 'categorical';
    final fieldIcon =
        MedicationData.featureIcons[feature] ??
        (meta?['type'] == 'numeric'
            ? Icons.numbers_rounded
            : Icons.notes_rounded);

    if (isDropdown) {
      List<String> options = (meta?['options'] as List? ?? [])
          .map((e) => e.toString())
          .toList();
      options.sort();

      return Container(
        decoration: BoxDecoration(
          color: Colors.grey.shade50,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.transparent),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 8,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: DropdownButtonFormField<String>(
          value: controller?.text.isNotEmpty == true ? controller!.text : null,
          items: options
              .map(
                (o) => DropdownMenuItem(
                  value: o,
                  child: Container(
                    alignment: Alignment.centerLeft,
                    height: 48,
                    child: Text(
                      o,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF37474F),
                      ),
                    ),
                  ),
                ),
              )
              .toList(),
          itemHeight: 64,
          onChanged: (v) {
            if (v != null) {
              onChanged(v);
            }
          },
          decoration: _getDropdownDecoration(feature, fieldIcon, accentColor),
          validator: (v) => v == null || v.isEmpty ? 'Required' : null,
          isExpanded: true,
          icon: Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: accentColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              Icons.keyboard_arrow_down_rounded,
              color: accentColor,
              size: 20,
            ),
          ),
          dropdownColor: Colors.white,
          borderRadius: BorderRadius.circular(20),
          elevation: 4,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w500,
            color: Color(0xFF334155),
          ),
        ),
      );
    }

    return Container(
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: TextFormField(
        controller: controller,
        keyboardType: meta?['type'] == 'numeric'
            ? const TextInputType.numberWithOptions(decimal: true)
            : TextInputType.text,
        decoration: _getInputDecoration(feature, fieldIcon, accentColor),
        style: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: Color(0xFF37474F),
        ),
        validator: (v) => v == null || v.isEmpty ? 'Required' : null,
      ),
    );
  }

  InputDecoration _getInputDecoration(
    String label,
    IconData icon,
    Color color,
  ) {
    return InputDecoration(
      labelText: label.replaceAll('_', ' '),
      labelStyle: TextStyle(
        color: Colors.grey.shade600,
        fontSize: 14,
        fontWeight: FontWeight.w600,
      ),
      floatingLabelStyle: TextStyle(color: color, fontWeight: FontWeight.bold),
      prefixIcon: Container(
        margin: const EdgeInsets.fromLTRB(16, 12, 12, 12),
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: color.withOpacity(0.12),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Icon(icon, color: color, size: 22),
      ),
      prefixIconConstraints: const BoxConstraints(minWidth: 50, minHeight: 50),
      filled: true,
      fillColor: Colors.white,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(20),
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(20),
        borderSide: BorderSide.none,
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(20),
        borderSide: BorderSide(color: color, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(20),
        borderSide: BorderSide(color: Colors.red.shade300, width: 1.5),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(20),
        borderSide: const BorderSide(color: Colors.red, width: 2),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
    );
  }

  InputDecoration _getDropdownDecoration(
    String label,
    IconData icon,
    Color color,
  ) {
    return InputDecoration(
      labelText: label.replaceAll('_', ' '),
      labelStyle: TextStyle(
        color: Colors.grey.shade600,
        fontSize: 14,
        fontWeight: FontWeight.w600,
      ),
      floatingLabelStyle: TextStyle(color: color, fontWeight: FontWeight.bold),
      prefixIcon: Container(
        margin: const EdgeInsets.fromLTRB(16, 12, 12, 12),
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: color.withOpacity(0.12),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Icon(icon, color: color, size: 22),
      ),
      prefixIconConstraints: const BoxConstraints(minWidth: 50, minHeight: 50),
      filled: true,
      fillColor: Colors.white,
      border: InputBorder.none,
      enabledBorder: InputBorder.none,
      focusedBorder: InputBorder.none,
      errorBorder: InputBorder.none,
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
    );
  }
}

class PredictionResultCard extends StatelessWidget {
  final Map<String, dynamic> result;
  final Animation<double> scaleAnimation;

  const PredictionResultCard({
    super.key,
    required this.result,
    required this.scaleAnimation,
  });

  @override
  Widget build(BuildContext context) {
    final data = result['data'] ?? {};
    final medication = data['recommendedMedicine'] ?? 'Unknown';
    final dosage = data['dosageMg']?.toString() ?? '';
    final confidence = (data['medicineConfidence'] as num?) ?? 0;
    final confidencePercent = (confidence * 100).toStringAsFixed(1);

    String displayTitle = medication.toString();
    if (dosage.isNotEmpty) {
      displayTitle += ' ($dosage)';
    }

    return ScaleTransition(
      scale: scaleAnimation,
      child: Container(
        padding: const EdgeInsets.all(28),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF00C853), Color(0xFF64DD17)], // Vibrant Green
          ),
          borderRadius: BorderRadius.circular(30),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF00C853).withOpacity(0.4),
              blurRadius: 24,
              offset: const Offset(0, 12),
            ),
          ],
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.25),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 10,
                  ),
                ],
              ),
              child: const Icon(
                Icons.medication_rounded,
                color: Colors.white,
                size: 48,
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'Recommended Medication',
              style: TextStyle(
                color: Colors.white,
                fontSize: 15,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(height: 10),
            Text(
              displayTitle,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 28,
                fontWeight: FontWeight.w900,
                shadows: [
                  Shadow(
                    color: Colors.black26,
                    offset: Offset(0, 2),
                    blurRadius: 4,
                  ),
                ],
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),

            // Confidence Meter
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.white.withOpacity(0.1)),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'ML Confidence', // Changed from AI to ML
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Text(
                        '$confidencePercent%',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: LinearProgressIndicator(
                      value: confidence.toDouble(),
                      backgroundColor: Colors.white.withOpacity(0.3),
                      valueColor: const AlwaysStoppedAnimation<Color>(
                        Colors.white,
                      ),
                      minHeight: 12, // Thicker bar
                    ),
                  ),

                  if (data['dosageConfidence'] != null) ...[
                    const SizedBox(height: 12),
                    Text(
                      'Dosage Confidence: ${(data['dosageConfidence'] * 100).toStringAsFixed(1)}%',
                      style: TextStyle(
                        color: Colors.white.withOpacity(1.0),
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: 20),
            Text(
              'This recommendation is generated by ML based on the patient profile.', // Updated text
              style: TextStyle(
                color: Colors.white.withOpacity(0.9),
                fontSize: 13,
                fontWeight: FontWeight.w500,
                fontStyle: FontStyle.italic,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
